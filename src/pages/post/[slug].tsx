/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import { formatDate } from '../../util/format';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
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
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>{`${post.data.title} | spacetraveling`}</title>
      </Head>

      <Header />
      <div className={styles.banner}>
        <Image
          src={post.data.banner.url}
          alt="Imagem"
          layout="fill"
          objectFit="cover"
        />
      </div>

      <main className={commonStyles.container}>
        <article className={styles.article}>
          <section className={styles.titleSection}>
            <h1>{post.data.title}</h1>
            <div>
              <small>
                <FiCalendar size={20} />{' '}
                {formatDate(post.first_publication_date)}
              </small>

              <small>
                <FiUser size={20} /> {post.data.author}
              </small>

              <small>
                <FiClock size={20} /> 4 min
              </small>
            </div>
          </section>

          {post.data.content.map(group => {
            return (
              <section className={styles.contentSection} key={group.heading}>
                <h2>{group.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(group.body),
                  }}
                />
              </section>
            );
          })}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.content'],
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: response.data,
  };

  return {
    props: {
      post,
    },
  };
};
