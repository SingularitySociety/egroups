import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import EditableField from '../../common/EditableField';
import DeleteIcon from '@material-ui/icons/Delete';
import { FormGroup, Button, Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';
import LockedArea from '../../common/LockedArea';


const styles = theme => ({
});

class ArticleSettings extends React.Component {
  constructor(props) {
    super(props);
    const { db, group, arp, match:{params:{articleId}} } = props;
    this.refEntity = db.doc(`groups/${group.groupId}/${arp.collection}/${articleId}`);
    this.state = {entity:null, articleId};
  }
  async componentDidMount() {
    const { match:{params:{articleId}}, callbacks, group, arp } = this.props;
    callbacks.setTabbar(`${arp.tabLeaf}.settings`, `${arp.leaf}/${articleId}`);

    this.detacher = this.refEntity.onSnapshot((doc)=>{
      const entity = doc.data();
      if (entity) {
        this.setState({entity});
      } else {
        this.setState({redirect:`/${group.groupName}/${arp.root}`});
      }
    });
  }
  componentWillUnmount() {
    this.detacher();
  }
  onSave = name => async value => {
    await this.refEntity.set({[name]:value}, {merge:true});
  }
  onDelete = async () => {
    await this.refEntity.delete();
  }
  render() {
    const { group, arp } = this.props;
    const { entity, redirect, articleId } = this.state;
    if (redirect) {
      return <Redirect to={redirect} />
    }
    if (!entity) {
      return "";
    }
    const isGroupHomepage = group.homepageId === articleId && arp.collection === "pages";
    return (
      <div>
        <FormGroup row>
          <EditableField label={<FormattedMessage id="article.title"/>} value={entity.title} onSave={this.onSave('title')}/>
        </FormGroup>
        {
          isGroupHomepage ?
          <Typography color="textSecondary"><FormattedMessage id="article.is.homepage" /></Typography>
          :
            <LockedArea label={<FormattedMessage id="warning.dangerous" />}>
              <Button variant="contained" onClick={this.onDelete}>
                <DeleteIcon color="error" />
                <Typography color="error"><FormattedMessage id="destroy.article" /></Typography>
              </Button>
            </LockedArea>
        }
      </div>
    )
  }
}

ArticleSettings.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(ArticleSettings);