import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import EditableField from '../common/EditableField';
import DeleteIcon from '@material-ui/icons/Delete';
import { FormGroup, Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';


const styles = theme => ({
});

class ArticleSettings extends React.Component {
  constructor(props) {
    super(props);
    const { db, group, arp, match:{params:{articleId}} } = props;
    this.refEntity = db.doc(`groups/${group.groupId}/${arp.collection}/${articleId}`);
    this.state = {entity:null};
  }
  async componentDidMount() {
    const { match:{params:{articleId}}, selectTab, group, arp } = this.props;
    selectTab(`${arp.tabLeaf}.settings`, `${arp.leaf}/${articleId}`);

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
    const { entity, redirect } = this.state;
    if (redirect) {
      return <Redirect to={redirect} />
    }
    if (!entity) {
      return "";
    }
    return (
      <div>
        <FormGroup row>
          <EditableField label={<FormattedMessage id="article.title"/>} value={entity.title} onSave={this.onSave('title')}/>
        </FormGroup>
        <Button variant="contained" onClick={this.onDelete}>
          <DeleteIcon color="error" />
        </Button>
      </div>
    )
  }
}

ArticleSettings.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(ArticleSettings);