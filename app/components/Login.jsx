'use client'

import { Box, Typography, Button, TextField, FormControl, Snackbar, Alert } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { auth } from '@/app/server/firebase'
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

const Login = () => {

 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [openSnack, setOpenSnack]= useState(false)
 const router = useRouter();

  const handleLogin = async() => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/dashboard')
      
      console.log('exito');
    } catch (err) {
      console.error('escribe un email y contraseña correctos', err)
      setOpenSnack(true)
    }
  }

  const handleSnackClose = () => {
    setOpenSnack(false)
  }

  return (
    <Box component="div" className="flex flex-col gap-8 justify-center items-center">
      <Box component="div">
        <Typography variant="h1" clahandleSnackClosessName="text-center">NOTE APP</Typography>
        <Typography variant="body2" className="text-center">Please Sign in</Typography>
      </Box>
      <FormControl className="flex flex-col gap-4">
        <TextField
          type="email"
          name="email"
          placeholder="Input email...."
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          type="password"
          name="password"
          placeholder="Input password...."
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" onClick={handleLogin}>Login</Button>
      </FormControl>
      <Snackbar
        autoHideDuration={5000}
        open={openSnack}
        onClose={handleSnackClose}
      >
        <Alert
          severity="warning"
          onClose={handleSnackClose}
        >
          Validese con un email y contraseña registrados
        </Alert>
      </Snackbar>
      <Box component="div">
        <Typography>If you do not have an account <Link href="/signUp">Sign Up here</Link>  </Typography>
      </Box>
    </Box>
  );
}

export default Login;