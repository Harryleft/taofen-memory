import React from 'react';
import { BOOKSTORE_FONTS, BOOKSTORE_STYLES } from '../../styles/bookstore';

const BookstoreHeader = () => (
  <div className={BOOKSTORE_STYLES.header.container}>
    <h2 className={BOOKSTORE_STYLES.header.title} style={{ fontFamily: BOOKSTORE_FONTS.fangsong }}>
      韬奋·时光书影
    </h2>
    <p className={BOOKSTORE_STYLES.header.subtitle} style={{ fontFamily: BOOKSTORE_FONTS.kai }}>
      探寻生活书店出版文化印记
    </p>
  </div>
);

export default BookstoreHeader;
