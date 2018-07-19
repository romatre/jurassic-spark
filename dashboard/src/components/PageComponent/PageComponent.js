import React from 'react'
import {Helmet} from "react-helmet";
require('./page.css');

export default (({ title, children }) => {
  return (
    <div className="page">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{title}</title>
      </Helmet>
      {children}
    </div>
  )
});