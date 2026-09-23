import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const createHttp = () => {
  const getJwt = () => {
    try {
      const auth = useAuthStore()
      return auth.jwt
    } catch {
      return null
    }
  }

  const get = async (path, params = {}) => {
    // 빈 값 제거
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== '')
    )
    try {
      const res = await axios({
        method: 'get',
        url: BASE_URL + path,
        headers: { jwt: getJwt() },
        params: cleanParams,
        responseType: 'json',
      })
      if (res.status === 200) {
        if (res.data.ret === '0000' || res.data.ret === '8888') return res
        alert(res.data.msg || '오류가 발생했습니다.')
        return null
      }
      alert('네트워크 오류가 발생했습니다.')
      return null
    } catch (err) {
      alert(err.message)
      return null
    }
  }

  const post = async (path, data = {}) => {
    const formData = new FormData()
    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }
    try {
      const res = await axios({
        method: 'post',
        url: BASE_URL + path,
        headers: { jwt: getJwt() },
        data: formData,
        responseType: 'json',
      })
      if (res.status === 200) {
        if (res.data.ret === '0000') return res
        alert(res.data.msg || '오류가 발생했습니다.')
        return null
      }
      alert('네트워크 오류가 발생했습니다.')
      return null
    } catch (err) {
      alert(err.message)
      return null
    }
  }

  const download = async (path, params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== '')
    )
    try {
      const res = await axios({
        method: 'get',
        url: BASE_URL + path,
        headers: { jwt: getJwt() },
        params: cleanParams,
        responseType: 'blob',
      })
      if (res.status === 200) return res
      alert('다운로드 오류가 발생했습니다.')
      return null
    } catch (err) {
      alert(err.message)
      return null
    }
  }

  return { get, post, download }
}

export const useHttp = () => createHttp()
