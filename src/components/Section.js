import React from 'react';
import * as API from '../api';
import {markdown} from 'markdown';

export default class Section extends React.Component {

    constructor (props, context) {
        super(props, context);
        this.context = context;
        this.state = this.getState(props);
    }

    componentDidMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(nextProps) {
        var state = this.getState(nextProps);

        this.makeLinks(state.html, html => {
            state.html = html;
            this.setState(state);
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.editing) React.findDOMNode(this.refs.editor).focus();
    }
    
    getState = props => ({
        locked: props.user && props.section.editor && props.user.username !== props.section.editor,
        editing: props.user && props.user.username === props.section.editor,
        content: props.section.content,
        html: props.section.content ? markdown.toHTML(props.section.content) : ''
    })

    render () {
        let content;

        if (this.state.editing) {
            content = <textarea ref='editor' className='twelve columns' defaultValue={this.state.content}
                onChange={this.updateContent} onBlur={this.save} />; 
        } else {
            content = <span dangerouslySetInnerHTML={ { __html: this.state.html } } />;
        }

        let classes = ['row', 'section'];

        if (this.state.editing) classes.push('editing');
        if (this.props.user) classes.push( this.state.locked ? 'locked' : 'editable');

        return <section onClick={this.startEditing} className={ classes.join(' ')}>
            {content}
        </section>;
    }

    updateContent = evt => this.setState({ content: evt.target.value });

    save = evt => {
        this.setState({ editing: false });

        API.pages.child(this.props.path).update({
            editor: null,
            content: this.state.content || null
        });
    }

    startEditing = evt => {
        if (evt.target.tagName === 'A') {
            var href = evt.target.getAttribute('href');
            if (href.indexOf('/page/') === 0) {
                this.context.router.transitionTo(href);
                return evt.preventDefault();
            }
            return;
        }

        if (!this.props.user || this.state.editing || this.state.locked) return;
        this.setState({ editing: true });
        API.pages.child(this.props.path).update({
            editor: this.props.user.username 
        });
    }

    makeLinks (html, callback) {
        const anchor = /\[\[(.*)\]\]/g;

        API.pages.once('value', snapshot => {
            let pages = snapshot.exportVal();
            let keys = Object.keys(pages);

            callback(html.replace(anchor, (match, anchorText) => {
                for (let key of keys)
                    if (pages[key].title === anchorText.trim())
                        return `<a href="/page/${key}">${anchorText}</a>`;
            }));
        });

    }
}

Section.contextTypes = {
    router: React.PropTypes.func.isRequired
};
