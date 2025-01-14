import Head from "next/head";
import TweetEmbed from "react-tweet-embed";
import { useState, useEffect } from "react";
import BeatLoader from "react-spinners/BeatLoader"; // Loading animation
import { Modal } from 'react-responsive-modal';
import cheerio from "cheerio";
import Welcome from '../components/Welcome'
import Login from '../components/Login'
import Paste from '../components/Paste'
import Success from '../components/Success'

export default function Home() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [list, setList] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [session, setSession] = useState(null);
  const [description, setDescription] = useState(null);
  const [name, setName] = useState(null);
  const [subscribers, setSubscribers] = useState(null);

  function handleLogin() {
    fetch("/api/auth/getOAuthToken")
      .then((res) => res.json())
      .then((json) => {
        const { oauth_token } = json;

        window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
      });
  }

  function openModal() {
    if (!modal) {
      setModal(true);
    }
  }

  function closeModal() {
    if (modal) {
      setModal(false);
      setConfirmation("");
    }
  }

  function handleSignOut() {
    localStorage.removeItem("session");
    window.location.reload();
  }

  function getListId(url) {
    const tokens = url.split("/");
    return tokens[tokens.length - 1];
  }

  function getListInfo(url) {
    setList(url);
    fetch("/api/list", {
      method: "POST",
      body: JSON.stringify({
        ...session,
        list_id: getListId(url),
        list_url: url,
      })
    }).then((res)=> res.json())
     .then((json)=> {
       const {name} = json;
       setName(name)
     }).then(()=>{
        setLoading(false);
      });

  }

  function handleSubmit() {
    setLoading(true);
    fetch("/api/block", {
      method: "POST",
      body: JSON.stringify({
        ...session,
        list_id: getListId(list),
        list_url: list,
      }),
    }).then(() => {
      setLoading(false);
      closeModal();
      setStep(3);
    });
  }

  useEffect(() => {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    const access_token = params.get("access_token");
    const access_token_secret = params.get("access_token_secret");
    const screen_name = params.get("screen_name");
    console.log(list != "" ? getListInfo(list) : null);
    if (screen_name && access_token_secret && access_token) {
      const sess = {
        access_token,
        access_token_secret,
        screen_name,
      };

      localStorage.setItem("session", JSON.stringify(sess));
      setSession(sess);
      setStep(1);
      window.history.replaceState(null, null, window.location.pathname);
    } else if (localStorage.getItem("session")) {
      setSession(JSON.parse(localStorage.getItem("session")));
    }
  }, []);

  function renderContent() {
    switch (step) {
      case 0:
        return <Welcome setStep={setStep} />
      case 1:
        return <Login handleLogin={handleLogin} handleSignOut={handleSignOut} session={session} setStep={setStep} />
      case 2:
        return <Paste getListInfo={getListInfo}
                      getListInfo={getListInfo}
                      list={list}
                      openModal={openModal}
                      name={name}
                      session={session}
                      setList={setList}
                      setStep={setStep}
                       setList={setList} />
      case 3:
        return <Success />
    }
  }

  return (
    <div className="root">
      <Head>
        <title>Listless | Block list subscribers in one click</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta
          name="description"
          content="Harassed by a list? Block the shit out of it."
        />
        <meta property="og:type" content="website" />
        <meta
          name="og:title"
          property="og:title"
          content="Forever Listsless | Block lists in one click"
        />
        <meta
          name="og:description"
          property="og:description"
          content="Harassed by a list? Block the shit out of it."
        />
        <meta property="og:site_name" content="foreverlistless.xyz" />
        <meta property="og:url" content="https://foreverlistless.xyz" />
        <meta
          name="twitter:title"
          content="Listless | Block list subscribers in one click"
        />
        <meta
          name="twitter:description"
          content="Don't like a bad list? Block the list, its author, and every single person who liked it—in one click."
        />
        <meta name="twitter:site" content="https://foreverlistless.xyz" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        ></link>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=UA-173583190-3%22%3E" >
        </script>
        <script dangerouslySetInnerHTML={
          { __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments)}
              gtag("js", new Date());
              gtag("config", "G-8PEFF3YBHP");
          `}
        }>
        </script>
      </Head>
      <Modal open={modal} onClose={closeModal} center>
        <div className="modal__header">
          <h3>Are you sure you want to block this list?</h3>
        </div>
        <div className="modal__content">
          <p>You will block the author, all people that subscribe to this list, and unfollow all of these individuals.</p>
          <input value={confirmation} onChange={e => setConfirmation(e.target.value)} placeholder="Type: I confirm I want to block" />
          <div>
            <button onClick={closeModal}>Cancel</button>
            {confirmation.toLowerCase() == 'i confirm i want to block' ? (
              <button onClick={handleSubmit} className="megablock_button">
                {!loading ? (
                  <span>Block!</span>
                ) : (
                  <CustomLoader />
                )}
              </button>
            ) : (
              <button>Enter input</button>
            )}
          </div>
        </div>
      </Modal>
      <div className="content">{renderContent()}</div>
    </div>
  );
}

// Loading animation
function CustomLoader() {
  return <BeatLoader
    size={6}
    color={"#fff"}
    loading={true}
  />
}
