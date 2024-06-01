import './index.less'
import React from 'react'
import {Input, Progress} from 'antd'
import {SearchOutlined} from '@ant-design/icons'
import {debounce} from '~/utils/lodash'

interface IProps {
  view: any,
}

interface ISearchResult {
  href: string,
  title: string,
}

interface IState {
  results: ISearchResult[],
  isComp: boolean,
  progress: number,
  showProgress: boolean,
}

export default class Search extends React.PureComponent<IProps, IState> {
  public state = {
    results: [],
    isComp: false,
    progress: 0,
    showProgress: false,
  }

  private searchValue = ''

  componentWillUnmount() {
    const {view} = this.props
    view.clearSearch()
  }

  private handleCompositionStart = () => {
    this.setState({isComp: true})
  }

  private handleCompositionEnd = () => {
    this.setState({isComp: false})
  }

  private handleChange = debounce(async ({target: {value}}) => {
    if (this.state.isComp) {
      return
    }
    this.searchValue = value
    if (!value) {
      this.setState({results: [], showProgress: false})
      return
    }
    const {view} = this.props
    const g = view.search({query: value})
    const results = []
    this.setState({showProgress: true, progress: 0})
    while (true) {
      if (this.searchValue !== value) {
        return
      }
      const result: any = await new Promise((res) => {
        requestAnimationFrame(async () => {
          const result = await g.next()
          res(result)
        })
      })
      if (result.value?.progress) {
        this.setState({progress: Math.round(100 * result.value.progress)})
        continue
      }
      if (result.value === 'done') {
        break
      }
      results.push(result.value)
    }
    this.setState({results, showProgress: false})
  })

  private renderResults() {
    const {view} = this.props
    const {results} = this.state
    return (
      <div className="search-results">
        {results.map((r, i) => (
          <div className="search-result" key={i}>
            <div className="search-result-title">{r.label}</div>
            {r.subitems.map(({excerpt, cfi}, i) => (
              <div key={i} className="search-result-excerpt" onClick={() => view.goTo(cfi)}>
                {excerpt.pre}
                <span className="search-result-match">
                  {excerpt.match}
                </span>
                {excerpt.post}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  render() {
    const {showProgress, progress} = this.state
    return (
      <div className="book-search">
        <Input className="book-search-input" prefix={<SearchOutlined/>} placeholder="搜索全书"
          onChange={this.handleChange} onCompositionStart={this.handleCompositionStart} onCompositionEnd={this.handleCompositionEnd}/>
        {showProgress && <Progress className="search-progress" type="circle" percent={progress} format={() => '搜索中...'}/>}
        {!showProgress && this.renderResults()}
      </div>
    )
  }
}
