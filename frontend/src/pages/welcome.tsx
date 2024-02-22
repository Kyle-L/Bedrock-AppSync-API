import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { useBackground } from '../providers/BackgroundProvider';
import Container from '../components/layouts/Container';

export default function Welcome() {
  const { setBackground } = useBackground();
  const { userAttributes } = useAuth();

  useEffect(() => {
    setBackground('midight');
  }, []);

  return (
    <Container>
      <div className="w-full mt-4 mb-8">
        <h1 className="text-2xl font-extrabold w-full">
          Hey {userAttributes?.name ? userAttributes.name : ''} 👋
        </h1>
        <p className="text-slate-500 mt-2">
          This project showcases a serverless and scalable chatbot implemented using AWS CDK
          Infrastructure-as-code. The architecture leverages AWS AppSync with a WebSocket API for
          real-time chat functionality, supported by AWS Bedrock for advanced AI capabilities.
        </p>
        <p className="text-slate-500 mt-2">
          Here, you can interact with some pre-programmed chatbots to see how the API can be used to
          power advanced chatbots that can be customized for your business use-cases.
        </p>
      </div>
      <Link className="w-full btn" to="/personas">
        Get Started
      </Link>
    </Container>
  );
}
