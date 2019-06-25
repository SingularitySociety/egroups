import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Paper, Grid } from '@material-ui/core';
import MUILink from '@material-ui/core/Link';
import { Link } from 'react-router-dom';
import CreateNew from './common/CreateNew';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';

const styles = theme => ({
  createNew: {
    marginBottom: theme.spacing(1),
  },
  paper: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
  },
  link: {
    color: "#333",
  },
});

class GroupList extends React.Component {
  state = { groups:[] };
  async componentDidMount() {
    const { db } = this.props;
    const ref = db.collection("groups").where("groupName", ">", "");
    const snapshot = await ref.get();
    //console.log(snapshot);
    const groups = [];
    snapshot.forEach((doc)=>{
        const group = doc.data();
        group.groupId = doc.id;
        groups.push(group);
    });
    this.setState({groups:groups});
  }

  createNew = async (value) => {
    console.log("createNew", value);
    const { db, user } = this.props;
    const doc = await db.collection("groups").add(
      { title:value, owner:user.uid, ownerName:user.displayName } // HACK: see groupDidCreate cloud function
    )
    console.log(doc.id);
    this.setState({redirect:`/a/new/${doc.id}`});
  }
  render() {
    const { classes } = this.props;
    const { redirect } = this.state;
    if (redirect) {
      return <Redirect to={redirect} />
    }
    return <Grid container justify="center">
        <Grid item className={classes.createNew}>
          <CreateNew label={<FormattedMessage id="group" />} 
            createNew={this.createNew} action={<FormattedMessage id="create" />} />
        </Grid>
        { 
            this.state.groups.map((group)=> {
                return (
                  <Grid item key={group.groupId}  xs={12}>
                  <MUILink component={Link} className={classes.link}
                    to={"/" + (group.groupName || group.groupId)}>
                      <Paper className={classes.paper}> 
                    {group.title}
                    </Paper>
                  </MUILink>
                  </Grid>);
            })
        }
    </Grid>
  }
}

GroupList.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(GroupList);