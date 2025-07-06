import Head from 'next/head';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';

function Error({ statusCode }) {
  const title = statusCode === 404 ? 'Page Not Found' : 'Something went wrong';
  const message = statusCode === 404
    ? 'The page you are looking for does not exist.'
    : 'An unexpected error has occurred.';

  return (
    <>
      <Head>
        <title>{title} - SkillSwap</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-700 p-6">
        <Card className="max-w-md w-full text-center space-y-6 p-8 animate-fade-in">
          <h1 className="text-5xl font-bold text-primary-600">{statusCode}</h1>
          <h2 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100">{title}</h2>
          <p className="text-secondary-600 dark:text-secondary-300">{message}</p>
          <Button as="a" href="/" size="lg">Go Home</Button>
        </Card>
      </div>
    </>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 