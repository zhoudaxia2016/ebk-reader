import './index.less'
import {PictureOutlined} from '@ant-design/icons'
import {Carousel, Modal, notification} from 'antd'
import {Button} from 'antd'
import React from 'react'

interface IProps {
  getImgs: () => HTMLImageElement[],
  onClose: () => void,
}

interface Img {
  dom: HTMLImageElement,
  src: string,
}

interface IState {
  imgs: Img[],
}

export default class ImgViewer extends React.PureComponent<IProps, IState> {
  public state: IState = {
    imgs: [],
  }

  private open = () => {
    const {getImgs} = this.props
    const imgs = getImgs()
    if (imgs.length === 0) {
      notification.warning({message: '本章节没有图片', duration: 2})
      return
    }
    this.setState({
      imgs: imgs.map(dom => ({
        src: dom.getAttribute('src') as string,
        dom: dom,
      }))
    })
  }

  private close = () => {
    this.setState({imgs: []})
    const {onClose} = this.props
    onClose()
  }

  private jump = (img) => {
    img.dom.scrollIntoView()
    this.close()
  }

  render() {
    const {imgs} = this.state
    return (
      <>
        <Button type="text">
          <PictureOutlined onClick={this.open}/>
        </Button>
        <Modal className="img-viewer" open={imgs.length > 0} onCancel={this.close} footer={null}>
          <Carousel adaptiveHeight>
            {imgs.map(img => (
              <div className="img-viewer-item" key={img.src}>
                <img src={img.src}/>
                <Button className="img-viewer-jump" type="text" onClick={() => this.jump(img)}>
                  跳转
                </Button>
              </div>
            ))}
          </Carousel>
        </Modal>
      </>
    )
  }
}
