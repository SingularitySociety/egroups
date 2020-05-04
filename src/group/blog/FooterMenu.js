import React, { useState, useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
  footerMenu: {
    position: "fixed",
    bottom: "10px",
    width: "100%",
    left: 0,
    "z-index": 10,
  },
  footerFrame: {
    border: "1px solid #ccc",
    "background-color": "#fff",
    width: "80%",
    margin: "auto",
  },
  footerInner: {
    margin: "10px",
    overflow: "hidden",
  },
  footerButton: {
    width: "50%",
    float: "left",
  },
  footerEnrollment: {
    borderRadius: "10px",
    textAlign: "center",
    fontSize: "2rem",
    width: "100%",
    padding: "20px"
  },
  footerPrice: {
    textAlign: "center",
    fontSize: "1.5rem",
  },
});

function FooterMenu(props) {
  const { group, classes } = props;
  const joinPath = `/g/${group.groupName}/` + (group.subscription ? "subscribe" : "join");

  return <div className={classes.footerMenu}>
           <div className={classes.footerFrame}>
             {group.subscription ? 
              <div className={classes.footerInner}>
                <div className={classes.footerButton}>
                  <div className={classes.footerPrice}>
                    {group.plans ?group.plans.map((plan) => {
                      return <span>月額{plan.price}円<br/></span>;
                    }) : "No Plan" }
                    （税別)
                  </div>
                </div>
                <div className={classes.footerButton}
                     color="primary"
                >
                  <Button variant="contained" color="primary" component={Link} to={joinPath}
                          className={classes.footerEnrollment}
                  >
                    <FormattedMessage id="join" />
                  </Button>
                </div>
              </div> :
              <div className={classes.footerInner}>
                <div>
                  <Button variant="contained" color="primary" component={Link} to={joinPath}
                          className={classes.footerEnrollment}
                  >
                    <FormattedMessage id="join" />
                  </Button>
                </div>
              </div>

             }
           </div>
         </div>;
};

export default withStyles(styles)(FooterMenu);
