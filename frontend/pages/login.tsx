import Link from 'next/link'
import React from 'react'
import Router from 'next/router'
import Image from 'next/image'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { alertError } from '../utils'
import styles from '../styles/Login.module.css'
import { useUser } from '../hooks/useUser'

const LoginPage = () => {
  const { login } = useUser()

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    const data = {
      email: event.target.email.value,
      password: event.target.password.value,
    }

    if (!data.email) return await alertError('email field is required!')
    if (!data.password) return await alertError('password field is required!')
    
    try {      
      await login(data.email, data.password)
      Router.push('/list-books')
    } catch (error) {
      await alertError('Invalid credentials! Try again')
      console.log(error)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>Login</span>
        <Image
          src="/login.svg"
          alt="Picture of the author"
          width={300}
          height={300}
        />
      </div>

      <div onSubmit={handleSubmit} className={styles.main}>
        <form className={styles.inputs}>
          <div className={styles.innerInput}>
            <FontAwesomeIcon className={styles.icon} icon={faEnvelope} />
            <input type='email' placeholder='email' name='email' />
          </div>

          <div className={styles.innerInput}>
            <FontAwesomeIcon className={styles.icon} icon={faLock} />
            <input type='text' placeholder='password' name='password' />
          </div>

          <button type='submit'>Login</button>
          <Link href="/register">I don&apos;t have an account</Link>
        </form>
      </div>
    </div>
  )
}

export default LoginPage;
