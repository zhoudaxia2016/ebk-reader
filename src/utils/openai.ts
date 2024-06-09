import OpenAI from 'openai'
import {userInfoStorage} from '~/storage/localStorage'

// 本地部署sakurallm 参考https://github.com/SakuraLLM/SakuraLLM
class Translator {
  private openai: OpenAI

  constructor(host?: string) {
    if (host) {
      this.init(host)
    }
  }

  public init(host) {
    this.openai = new OpenAI({
      apiKey: '123456', // 随便填
      baseURL: `http://${host}/v1`,
      dangerouslyAllowBrowser: true,
    })
  }

  async translate(text) {
    if (!this.openai) {
      return
    }
    const query = '将下面的日文单词翻译成中文：' + text
    const chatCompletion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: '你是一个轻小说翻译模型，可以流畅通顺地以日本轻小说的风格将日文翻译成简体中文，并联系上下文正确使用人称代词，不擅自添加原文中没有的代词。'
        },
        {
          role: 'user',
          content: query,
        }
      ],
      model: 'sukinishiro',
    })
    return chatCompletion.choices[0].message.content
  }
}

const translator = new Translator(userInfoStorage.get('openaiHost') || process.env.REACT_APP_OPENAI_HOST)

export {translator}
