import React from 'react';
import { Redirect } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Header from './Header';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
});

const Account = props => {
  const { classes, user } = props;

  if (!user) {
    return <Redirect to={"/"} />;
  }
  const  createRow = (name, value) => { return {name, value} };
  const rows = [
    createRow("名前", user.displayName),
    createRow("メール", user.email),
  ];
  return (
    <React.Fragment>
      <Header user={user} login="/a/Login/target/a/accoount" />
      <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
          <Grid className={classes.main}>
            <div>
              <Typography variant="h3" component="h2">
                アカウント
              </Typography>
            </div>
            <Paper>
              <Table>
                <TableBody>
                  {
                    rows.map(row => {
                      return (
                        <TableRow key={row.name}>
                          <TableCell className={classes.field}>{row.name}</TableCell>
                          <TableCell>{row.value}</TableCell>
                        </TableRow>
                      );
                    })
                  }
                </TableBody>
              </Table>
            </Paper>
          </Grid>
      </Grid>
    </React.Fragment>
  );    
};

export default withStyles(styles)(Account);
