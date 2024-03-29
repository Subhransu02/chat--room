import PropTypes from 'prop-types';
import React from 'react';

const BaseLayout = (props) => {
  const { children } = props;

  return (
    <div id="app">
      <div className="container min-vh-100">
        {children}
      </div>
    </div> 
  );
};

BaseLayout.propTypes = {
  children: PropTypes.node,
};

export default BaseLayout;
