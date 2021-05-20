/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { RichText } from 'prismic-dom';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import { formatDate } from '../../util/format';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      dimensions: {
        width: number;
        height: number;
      };
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  return (
    <>
      <Head>
        <title>{`${post.data.title} | spacetraveling`}</title>
      </Head>

      <main>
        <Header />

        <Image
          src={post.data.banner.url}
          alt="Imagem"
          height={post.data.banner.dimensions.height}
          width={post.data.banner.dimensions.width}
          className={styles.banner}
        />

        <article className={commonStyles.container}>
          <section>
            <h1>{post.data.title}</h1>
            <div>
              <div>
                <FiCalendar />
                <time>{post.first_publication_date}</time>
              </div>
              <div>
                <FiUser />
                <time>{post.data.author}</time>
              </div>
              <div>
                <FiClock />
                <time>4 min</time>
              </div>
            </div>
          </section>

          <div className={styles.article} />
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  // TODO
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  // const parsedContent = response.data.content.map()

  const post = {
    first_publication_date: formatDate(response.first_publication_date),
    data: response.data,
  };

  return {
    props: {
      post,
    },
  };
};
