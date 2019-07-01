import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Members from './Members';

function Listing(props) {
  const { user, db, group, history, callbacks } = props;
  useEffect(() => {
    callbacks.setTabbar("listing");
  }, [callbacks]);

  const context = { user, group, db, history, callbacks };
  return <Members {...context} />
}

Listing.propTypes = {
    callbacks: PropTypes.object.isRequired,
  };
  
export default Listing;