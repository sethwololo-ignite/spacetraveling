import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  console.log(postsPagination);
  return (
    <>
      <Head>
        <title>Posts | spacetravelling</title>
      </Head>

      <main className={styles.container}>
        <header>
          <img src="/images/logo.svg" alt="logo" />
        </header>

        {postsPagination.results.map(post => (
          <a href="/" className={styles.post} key={post.uid}>
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
        ))}

        <button type="button">Carregar mais posts</button>
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
      pageSize: 4,
    }
  );

  return {
    props: {
      postsPagination: postsResponse,
    },
  };
};
