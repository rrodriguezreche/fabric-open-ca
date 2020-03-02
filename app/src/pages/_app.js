import React from 'react';
import App from 'next/app';
import Jumbotron from 'react-bootstrap/Jumbotron';

import { library } from '@fortawesome/fontawesome-svg-core';

import {
  faAddressCard,
  faFileDownload
} from '@fortawesome/free-solid-svg-icons';

library.add(faAddressCard);
library.add(faFileDownload);

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;

    return (
      <Jumbotron>
        <Component {...pageProps} />
      </Jumbotron>
    );
  }
}

export default MyApp;
