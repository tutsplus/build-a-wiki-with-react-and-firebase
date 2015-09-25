import React from 'react';
import * as API from '../api';

import Section from './Section';

export default class Page extends React.Component {
    state = { page: {} }

    componentDidMount() {
        API.pages.child(this.props.params.id).on('value', this.updateContent);
    }

    componentWillReceiveProps(nextProps) {
        API.pages.child(this.props.params.id).off('value', this.updateContent);
        API.pages.child(nextProps.params.id).on('value', this.updateContent);
    }

    updateContent = (snapshot) => {
        let json = snapshot.exportVal();
        this.setState({
            page: json,
            sections: json.sections
        });
    }

    render () {
        let sections = [];

        if (this.state.page.title) { // Data is loaded
            if (this.state.sections) {
                sections = Object.keys(this.state.sections).map( id => <Section 
                            key={id} 
                            user={this.props.user}
                            path={this.props.params.id + '/sections/' + id}
                            section={this.state.sections[id]} />)
            }
        
            if (this.props.user)
                sections.push(<p key='addSection'> 
                    <button onClick={this.addSection}> Add Section </button>
                </p>);
        }

        return <article>
            <h1> {this.state.page.title || 'Loading...'} </h1>
            {sections}
        </article>;
    }

    addSection = evt => {
        let id;

        if (!this.state.sections) {
            id = 1;
            this.state.sections = {};
        } else {
            id = Math.max(...Object.keys(this.state.sections)) + 1;
        }

        this.state.sections[id] = {
            editor: this.props.user.username
        }

        this.setState({
            sections: this.state.sections 
        });
    }
}
