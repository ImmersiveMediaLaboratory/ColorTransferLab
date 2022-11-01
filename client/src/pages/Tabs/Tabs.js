import React from 'react';
import PropTypes from 'prop-types';
import Tab from './Tab';


// id="rendererref" tabs="tabs_rendererref" tabList="tab-list_rendererref" tabListItem="tab-list-item_rendererref" tabListActive="tab-list-active_rendererref" tabContent="tab-content_rendererref">
class Tabs extends React.Component {
    static propTypes = {
        children: PropTypes.instanceOf(Array).isRequired,
    }

    constructor(props) {
        super(props);

        this.tabList = "tab-list_" + this.props.id
        this.tabListItem = "tab-list-item_" + this.props.id
        this.tabListActive = "tab-list-active_" + this.props.id
        this.tabContent = "tab-content_" + this.props.id
        this.tabs = "tabs_" + this.props.id

        this.state = {
            activeTab: this.props.children[0].props.label,
        };
    }

    
      onClickTabItem = (tab) => {
          this.setState({ activeTab: tab });
      }

      componentDidMount() {
        {this.props.children.map((child) => {
          const { label } = child.props;

          
          try {
            
            var cc = document.getElementById(child.props.children.props.id)
            if (child.props.label !== this.state.activeTab){
              
              cc.style.display = "none"
            }
            else{
              cc.style.display = "inline"
            }
          }
          catch {}
        })}
      }
    

      render() {
        const {
          onClickTabItem,
          props: {
            children,
          },
          state: {
            activeTab,
          }
        } = this;
    
        return (
        //   <div className={this.props.tabs}>
          <div className={this.tabs}>
            <ol className={this.tabList}>
            {/* <ol className={this.props.tabList}> */}
              {children.map((child) => {
                const { label } = child.props;

                
                try {
                  
                  var cc = document.getElementById(child.props.children.props.id)
                  if (child.props.label !== activeTab){
                    
                    cc.style.display = "none"
                  }
                  else{
                    cc.style.display = "inline"
                  }
                }
                catch {}


    
                return (
                  <Tab 
                    activeTab={activeTab}
                    key={label}
                    label={label}
                    onClick={onClickTabItem}
                    // tabListItem = {this.props.tabListItem}
                    // tabListActive = {this.props.tabListActive}
                    tabListItem = {this.tabListItem}
                    tabListActive = {this.tabListActive}
                  />
                );
              })}
            </ol>

            {/* <div className={this.props.tabContent}> */}
            <div className={this.tabContent}>
              {children.map((child) => {


                try {
                  var cc = document.getElementById(child.props.children.props.id)
                  if (child.props.label !== activeTab){
                    
                    cc.style.display = "none"
                  }
                  else{
                    cc.style.display = "inline"
                  }
                }
                catch {}
                //child.props.children.props.style.display = "none"
                //if (child.props.label !== activeTab) return undefined;
                return child.props.children;
              })}
            </div>
          </div>
        );
      }
  }

export default Tabs;