import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import EditableField from '../common/EditableField';
import { FormGroup } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';


const styles = theme => ({
});

class BlogSettings extends React.Component {
  constructor(props) {
    super(props);
    const { db, group, match:{params:{articleId}} } = props;
    this.refEntity = db.doc(`groups/${group.groupId}/articles/${articleId}`);
    this.state = {entity:null};
  }
  onSave = name => async value => {
    await this.refEntity.set({[name]:value}, {merge:true});
  }
  async componentDidMount() {
    const { match:{params:{articleId}}, selectTab } = this.props;
    selectTab("article.settings", `bl/${articleId}`);

    this.refEntity.onSnapshot((doc)=>{
      const entity = doc.data();
      this.setState({entity});
    });
  }
  render() {
    const { entity } = this.state;
    if (!entity) {
      return "";
    }
    return (
      <div>
        <FormGroup row>
          <EditableField label={<FormattedMessage id="article.title"/>} value={entity.title} onSave={this.onSave('title')}/>
        </FormGroup>
      </div>
    )
  }
}

BlogSettings.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(BlogSettings);