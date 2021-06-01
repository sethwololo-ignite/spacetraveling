import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formatDate } from '../util/format';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  function formatPosts(posts: Post[]): Post[] {
    return posts.map(post => ({
      ...post,
      first_publication_date: formatDate(post.first_publication_date),
    }));
  }

  const [posts, setPosts] = useState<Post[]>(
    formatPosts(postsPagination.results)
  );
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function fetchMorePosts(): Promise<void> {
    if (!nextPage) {
      return;
    }

    const response = await (await fetch(nextPage)).json();
    const formattedPosts = formatPosts(response.results);
    setPosts([...posts, ...formattedPosts]);
    setNextPage(response.next_page);
  }

  return (
    <>
      <Head>
        <title>Posts | spacetravelling</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={styles.posts}>
          <header>
            <img src="/images/logo.svg" alt="logo" />
          </header>

          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a className={styles.post}>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div>
                  <div>
                    <FiCalendar size={20} />
                    <time>{post.first_publication_date}</time>
                  </div>
                  <div>
                    <FiUser size={20} />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}

          {nextPage && (
            <button type="button" onClick={fetchMorePosts}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
    }
  );

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsResponse.results,
      },
    },
  };
};
