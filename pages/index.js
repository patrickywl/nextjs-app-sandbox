import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import { getSortedPostsData } from '../lib/posts';
import Link from 'next/link';
import Datetime from '../components/date';
import { useEffect, useState } from 'react';


export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}


export default function Home({ allPostsData }) {
  const [wrappedFetch, setFetch] = useState()
  const [user, setUser] = useState({
    name: "",
    username: ""
  });
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    // This import is happening async, hence the DD RUM is being init before! ;)
    import("@hotwired/turbo").then((turbo) => {
      setFetch(() => {        
        // COMMENT NOT TO USE THE TURBO FETCH!
        if (turbo?.fetch) {
          return (url, option) => { return turbo.fetch(url, option) }
        }

        return (url, option) => { return window.fetch(url, option) }
      })
    }).catch((error) => {
      console.error(error)
      return setFetch(() => { return (url, option) => { return window.fetch(url, option) } })
    });
  }, [])

  useEffect(() => {
    if (wrappedFetch){
      const url = `${window.location.origin}/api/proxy/users`
      //const url = `http://127.0.0.1:8080/users`
      wrappedFetch(url, {
        method: "GET",
        // mode: "cors",
        headers: {
            "Content-Type": "application/json"
        }
      })
    }
  }, [wrappedFetch])

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Frank likes cheese. Frank likes a lot of things actually...</p>
        <p>
          (This is a sample website - you’ll be building a site like this on{' '}
          <a href="https://nextjs.org/learn">our Next.js tutorial</a>.)
        </p>
      </section>
      
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>{title}</Link>
              <br />
              <small className={utilStyles.lightText}>
                <Datetime dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
      
      <p>CREATE USERS!</p>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <div id="myForm">
            <label>Username:</label>
            <input type="text" id="username" name="username" value={user.username} onChange={(value) => {setUser((_prev) => {
              let newUser = { ..._prev }
              newUser.username = value.target.value
              return newUser
            })}} /><br></br>
            <label>Name:</label>
            <input type="text" id="name" name="name" value={user.name} onChange={(value) => {
              setUser((_prev) => {
                let newUser = { ..._prev }
                newUser.name = value.target.value
                return newUser
              })
            }} /><br></br>
            <button type="button" id="submitButton" onClick={() => {
              const url = `${window.location.origin}/api/proxy/users`
              // const url = `${window.location.origin}/appApi/users`
              wrappedFetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
              })
              .then(response => response.json())
              .then(responseData => {
                  // Handle the response from the server here
                  setCounter((prev) => prev+1)
                  if (window?.DD_LOGS?.logger){
                      if (responseData.success) {
                        window.DD_LOGS.logger.info("User creation resposnse", {responseData});
                      } else {
                          try {
                              throw new Error(JSON.stringify(responseData))
                          } catch (error) {
                              window.DD_LOGS.logger.error('Error occurred', {}, error);
                              if (window?.DD_RUM) {
                                  window.DD_RUM.addError(error)
                              }
                          }
                      }
                  }
              })
              .catch(error => {
                setCounter((prev) => prev+1)
                if (window?.DD_LOGS?.logger)
                      window.DD_LOGS.logger.error('Error occurred', {}, error);
                  if (window?.DD_RUM) {
                      window.DD_RUM.addError(error)
                  }
              });
            }}>Submit</button>
        </div>
      </section>

    </Layout>
  );
}