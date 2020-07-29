import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [step, setStep] = useState(0);
  const [s, ss] = useState(0);
  const [session, setSession] = useState(null);
  const ref = useRef();
  function handleLogin() {
    fetch("/api/auth/getOAuthToken")
      .then((res) => res.json())
      .then((json) => {
        const { oauth_token } = json;

        window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
      });
  }
  function handleSignOut() {
    localStorage.removeItem("session");
  }

  function getPostId(url) {
    const tokens = url.split("/");
    return tokens[tokens.length - 1];
  }

  function handleSubmit() {
    fetch("/api/block", {
      method: "POST",
      body: JSON.stringify({
        ...session,
        post_id: getPostId(ref.current.value),
        post_url: ref.current.value,
      }),
    }).then(() => setStep(2));
  }

  useEffect(() => {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    const access_token = params.get("access_token");
    const access_token_secret = params.get("access_token_secret");
    const screen_name = params.get("screen_name");
    if (screen_name && access_token_secret && access_token) {
      const sess = {
        access_token,
        access_token_secret,
        screen_name,
      };

      localStorage.setItem("session", JSON.stringify(sess));
      setSession(sess);
      window.location.href = "/";
    } else if (localStorage.getItem("session")) {
      setSession(JSON.parse(localStorage.getItem("session")));
    }
  }, []);

  function renderContent() {
    switch (step) {
      case 0:
        return (
          <div className="login_twitter">
            <h1>Login via Twitter</h1>
            <p>
              First up, we need to make sure that you're not a{" "}
              <span role="img" aria-label="Robot">
                🤖
              </span>
              . Get started by signing in with Twitter—we won't ever post on
              your behalf.
              <br /> Or use your account in any other way than to block people
              you ask us to.
            </p>
            {!session ? (
              // Manual redirection
              <button onClick={handleLogin} className="twitter_signin">
                <img src="/twitter-256.png" alt="Twitter logo" />
                <span>Login with Twitter</span>
              </button>
            ) : (
              <div className="profile">
                <img
                  src={`https://twivatar.glitch.me/@${session.screen_name}`}
                  alt="Profile picture"
                />
                <div>
                  <span>{session.screen_name}</span>
                  <button onClick={handleSignOut}>Sign out</button>
                </div>
              </div>
            )}
            <div className="progress_buttons">
              <button onClick={() => setStep(0)}>Go back</button>
              {/*TODO: Make button unclickable and gray if not authenticated */}
              {!session ? (
                <button className="add_positivity disabled_button" disabled>
                  Next step
                </button>
              ) : (
                <button onClick={() => setStep(1)} className="add_positivity">
                  Next step
                </button>
              )}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="login_twitter">
            <h1>Paste the Twitter post url</h1>
            <input
              type="text"
              ref={ref}
              className="twitter_input"
              placeholder="https://twitter.com/twitter/status/1234..."
            />
            <div className="progress_buttons">
              <button onClick={() => setStep(0)}>Go back</button>
              {/*TODO: Make button unclickable and gray if not authenticated */}
              {!session ? (
                <button className="add_positivity disabled_button" disabled>
                  Next step
                </button>
              ) : (
                <button onClick={handleSubmit} className="megablock_button">
                  MegaBlock!
                </button>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="login_twitter">
            <h1>MegaBlock Successful</h1>
            <p>We 🅱️locked that user and everyone who liked the post!</p>
            <div className="progress_buttons">
              <button onClick={() => setStep(0)}>Go back</button>
              {/*TODO: Make button unclickable and gray if not authenticated */}
            </div>
          </div>
        );
    }
  }
  return (
    <div className="root">
      <Head>
        <title>MegaBlock</title>
      </Head>
      <div className="content">{renderContent()}</div>
      <style jsx global>
        {`
          .twitter_signin {
            background-color: #0097ed;
            border: none;
            color: #fff;
            font-weight: 500;
            font-size: 17px;
            width: 220px;
            padding: 10px 0px;
            border-radius: 5px;
            margin: 20px 0px;
            transition: 50ms ease-in-out;
            text-decoration: none;
            display: inline-block;
          }
          .twitter_signin:hover {
            opacity: 0.7;
          }
          .twitter_signin > img {
            height: 20px;
            vertical-align: middle;
            float: left;
            padding-left: 10px;
          }
          .twitter_signin > span {
            vertical-align: middle;
          }
          .root {
            width: 100vw;
            height: 100vh;
            display: flex;
          }
          .content {
            align-items: center;
            justify-content: center;
            margin: auto;
          }
          .progress_buttons > button {
            display: inline-block;
            margin: 10px;
            font-size: 17px;
            padding: 11px 17.5px;
            border-radius: 6px;
            border: none;
            transition: 50ms ease-in-out;
          }
          .progress_buttons > button:nth-child(1):hover {
            opacity: 0.7;
          }
          .progress_buttons > button:focus {
            outline: none;
          }
          .twitter_input {
            width: 400px;
            height: 36px;
            border: 1px solid #aaa;
            background-color: white;
            border-radius: 2px;
            font-size: 20px;
          }
          .twitter_input:focus {
            outline: none;
          }

          body {
            font-family: "Inter", sans-serif;
            margin: 0px;
          }
          .container > div {
            display: inline-block;
            text-align: center;
          }
          .head {
            padding: 0px 20px 40px 20px;
            width: calc(100% - 40px);
            min-height: 320px;
          }
          .landing {
            margin-top: 40px;
          }
          .head > h1,
          .head > div > h1 {
            font-size: 55px;
            margin-block-end: 0px;
          }
          .head > h2,
          .head > div > h2 {
            margin-block-start: 5px;
          }
          .head > p,
          .head > div > p {
            color: rgb(107, 114, 128);
            font-size: 18px;
            line-height: 27px;
            max-width: 600px;
            margin: auto;
          }
          .head > p > a {
            color: #000;
            text-decoration: none;
            border-bottom: 1px solid #a550de;
          }
          .head > p > a:hover {
            opacity: 0.7;
          }
          .add_positivity {
            margin-top: 20px;
            font-size: 17px;
            padding: 11px 17.5px;
            border-radius: 6px;
            border: none;
            color: #fff;
            font-weight: 500;
            transition: 100ms ease-in-out;
            box-shadow: 0 4px 11px rgba(104, 117, 245, 0.35);
            background-color: rgb(88, 80, 236);
          }
          .add_positivity:hover {
            background-color: rgb(104, 117, 245);
          }
          .add_positivity:focus {
            outline: none;
          }
          .megablock_button {
            margin-top: 20px;
            font-size: 17px;
            padding: 11px 17.5px;
            border-radius: 6px;
            border: none;
            color: #fff;
            font-weight: 500;
            transition: 100ms ease-in-out;
            box-shadow: 0 4px 11px rgba(104, 117, 245, 0.35);
            background-color: #c00;
          }
          .megablock_button:hover {
            background-color: #d22;
          }
          .megablock_button:focus {
            outline: none;
          }
          .progress_buttons > button {
            display: inline-block;
            margin: 10px;
            font-size: 17px;
            padding: 11px 17.5px;
            border-radius: 6px;
            border: none;
            transition: 50ms ease-in-out;
          }
          .progress_buttons > button:nth-child(1):hover {
            opacity: 0.7;
          }
          .progress_buttons > button:focus {
            outline: none;
          }
          .tweets {
            min-height: calc(100vh - 300px);
            width: calc(100% - 40px);
            padding: 20px;
            background-color: #212937;
            border-top: 3px solid rgb(88, 80, 236);
          }
          .tweet {
            background-color: #fff;
            display: inline-block;
            max-width: 310px;
            padding: 10px 20px;
            border-radius: 5px;
            text-align: left;
            position: relative;
            margin: 10px;
            vertical-align: top;
          }
          .tweet > img:nth-child(1) {
            display: inline-block;
            vertical-align: middle;
            border-radius: 45px;
            height: 40px;
          }
          .pushpin {
            height: 40px;
            position: absolute;
            top: -20px;
            right: -20px;
          }
          .tweet_name {
            display: inline-block;
            font-size: 18px;
            color: rgb(88, 80, 236);
            text-decoration: none;
            transition: 50ms ease-in-out;
            vertical-align: middle;
            margin-left: 10px;
          }
          .tweet > p {
            margin-block-start: 9px;
            margin-block-end: 0px;
            font-size: 16px;
            display: block;
            line-height: 23px;
          }
          .tweet_editable {
            background-color: rgb(247, 247, 247);
            transform: translateY(20px);
            margin-bottom: 30px;
          }
          .tweet_editable > textarea {
            width: calc(100% - 10px);
            margin-top: 10px;
            border: none;
            background-color: rgb(240, 240, 240);
            border-radius: 5px;
            padding: 5px;
            font-family: "Inter", sans-serif;
            font-size: 15px;
            height: 80px;
            resize: none;
          }
          .timestamp {
            display: block;
            text-align: right;
            font-size: 14px;
            margin-block-start: 3px;
            margin-block-end: 5px;
            color: rgb(107, 114, 128);
          }
          .twitter_signin {
            background-color: #0097ed;
            border: none;
            color: #fff;
            font-weight: 500;
            font-size: 17px;
            width: 220px;
            padding: 10px 0px;
            border-radius: 5px;
            margin: 20px 0px;
            transition: 50ms ease-in-out;
            text-decoration: none;
            display: inline-block;
          }
          .twitter_signin:hover {
            opacity: 0.7;
          }
          .twitter_signin > img {
            height: 20px;
            vertical-align: middle;
            float: left;
            padding-left: 10px;
          }
          .twitter_signin > span {
            vertical-align: middle;
          }
          .profile {
            display: inline-block;
            padding: 10px;
            background-color: rgb(239, 239, 239);
            border-radius: 5px;
            min-width: 200px;
            text-align: left;
            margin: 20px 0px 10px 0px;
          }
          .profile > img {
            border-radius: 50%;
            vertical-align: middle;
            height: 40px;
          }
          .profile > div {
            display: inline-block;
            margin-left: 10px;
            vertical-align: middle;
            text-align: left;
          }
          .profile > div > span {
            display: block;
            font-weight: 500;
          }
          .profile > div > button {
            font-size: 13px;
            color: rgb(88, 80, 236);
            transition: 50ms ease-in-out;
            border: none;
            padding: 0px;
          }
          .profile > div > button:hover {
            opacity: 0.8;
          }
          .underline {
            color: #000;
            border-bottom: 1px solid #a550de;
          }
          .disabled_button {
            color: #000 !important;
            background-color: rgb(220, 220, 220);
            box-shadow: none !important;
            cursor: not-allowed;
          }
          .disabled_button:hover {
            background-color: rgb(220, 220, 220) !important;
          }
          .success_submit {
            padding-top: 30px;
          }
          .success_submit > h1 {
            margin-block-start: 0px;
          }
          .celebrate {
            font-size: 30px;
          }
          .loading-text {
            display: block;
            font-size: 30px;
            color: #fff;
          }
          @media screen and (max-width: 500px) {
            .head,
            .tweets {
              text-align: left !important;
            }
            .head {
              height: auto;
            }
          }
        `}
      </style>
    </div>
  );
}
