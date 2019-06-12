import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import theme from '../theme';
import { Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import RichTextEditor from 'react-rte';

const styles = {
  button: {
    marginRight: theme.spacing(1),
  }
};

// The toolbarConfig object allows you to specify custom buttons, reorder buttons and to add custom css classes.
  // Supported inline styles: https://github.com/facebook/draft-js/blob/master/docs/Advanced-Topics-Inline-Styles.md
  // Supported block types: https://github.com/facebook/draft-js/blob/master/docs/Advanced-Topics-Custom-Block-Render.md#draft-default-block-render-map
const toolbarConfig = {
  // Optionally specify the groups to display (displayed in the order listed).
  display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'LINK_BUTTONS', 'BLOCK_TYPE_DROPDOWN', 'HISTORY_BUTTONS'],
  INLINE_STYLE_BUTTONS: [
    {label: 'Bold', style: 'BOLD', className: 'custom-css-class'},
    {label: 'Italic', style: 'ITALIC'},
    {label: 'Underline', style: 'UNDERLINE'}
  ],
  BLOCK_TYPE_DROPDOWN: [
    {label: 'Normal', style: 'unstyled'},
    {label: 'Heading Large', style: 'header-one'},
    {label: 'Heading Medium', style: 'header-two'},
    {label: 'Heading Small', style: 'header-three'},
    {label: 'Code', style: 'code-block'},
    {label: 'Blockquote', style: 'blockquote'},
  ],
  BLOCK_TYPE_BUTTONS: [
    {label: 'UL', style: 'unordered-list-item'},
    {label: 'OL', style: 'ordered-list-item'}
  ]
};

class MarkupEditor extends React.Component {
  state = {
    value: RichTextEditor.createEmptyValue()
  }
  constructor(props) {
    super(props);
    console.log("SectionEditor");
  }
  componentDidMount() {
    console.log("SectionEditor:didMount");

  }
  onChange = (value) => {
    this.setState({value});
  }

  onSubmit = (e) => {
    e.preventDefault();
    const { value } = this.state;
    console.log(value.toString('html'));
    console.log(value.toString('markdown'));
  }
  onCancel = (e) => {
    console.log("cancelled");
    const value = RichTextEditor.createValueFromString("abcd**eda**few", 'markdown');
    this.setState({value});
  }
  render() {
    const { classes, action } = this.props;
    const { value } = this.state;
    return (
      <div>
        <div className={classes.frame}>
          <RichTextEditor autoFocus value={value} toolbarConfig={toolbarConfig} onChange={this.onChange} />
        </div>
        
        <Button variant="contained" color="primary" className={classes.button} 
                  onClick={this.onSubmit} type="submit">{action || "Save"}</Button>
        <Button variant="contained" className={classes.button} onClick={this.onCancel}>
            <FormattedMessage id="cancel" />
        </Button>
        </div>
    );
  }
}

MarkupEditor.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(MarkupEditor);