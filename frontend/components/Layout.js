import { Container } from 'semantic-ui-react';
import Header from './Header';

export default ({ children }) => {
  return (
    <>
      <Header />
      <Container>
        <main>{children}</main>
      </Container>
    </>
  );
};
