const agent = window.navigator.userAgent.toLowerCase()

export const isIPad = /iPad/i.test(agent)
export const isMobile = /Android|webOS|iPhone|iPod/i.test(agent)
