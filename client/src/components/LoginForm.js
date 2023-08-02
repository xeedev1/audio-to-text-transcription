import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const LoginForm = () => {
  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  });

  const handleSubmit = (values, { resetForm }) => {
    // Perform signup logic here, e.g., sending data to the server
    console.log(values);

    // Reset the form after successful submission
    resetForm();
  };

  return (
    <>
    <div className='form-container'>
    <div className='welcome-box'>
        <h1 className='box-title'>Glad To Have You Back!</h1>
        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatum eum non veniam et suscipit error tempora vero iste eius qui?</p>
    </div>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        <Form className='form'>
        <h1 className='box-title'>Login</h1>

          <div>
            <label htmlFor="email">Email:</label>
            <Field className="form-control" type="email" id="email" name="email" />
            <ErrorMessage name="email" component="div" className="error-message" />
          </div>

          <div>
            <label htmlFor="password">Password:</label>
            <Field className="form-control" type="password" id="password" name="password" />
            <ErrorMessage name="password" component="div" className="error-message" />
          </div>

          <button className='btn btn-info mt-2 btn-signup' type="submit">Login</button>
        </Form>
      </Formik>
    </div>
    </>
  );
};

export default LoginForm;
