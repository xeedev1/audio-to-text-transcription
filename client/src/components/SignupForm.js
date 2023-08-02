import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SignupForm = () => {
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const validationSchema = Yup.object({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
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
        <h1 className='box-title'>Welcome!</h1>
        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatum eum non veniam et suscipit error tempora vero iste eius qui?</p>
    </div>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        <Form className='form'>
        <h1 className='box-title'>Signup</h1>
          <div>
            <label htmlFor="firstName">First Name:</label>
            <Field className="form-control" type="text" id="firstName" name="firstName" />
            <ErrorMessage name="firstName" component="div" className="error-message" />
          </div>

          <div>
            <label htmlFor="lastName">Last Name:</label>
            <Field className="form-control" type="text" id="lastName" name="lastName" />
            <ErrorMessage name="lastName" component="div" className="error-message" />
          </div>

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

          <div>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <Field className="form-control" type="password" id="confirmPassword" name="confirmPassword" />
            <ErrorMessage name="confirmPassword" component="div" className="error-message" />
          </div>

          <button className='btn btn-info mt-2 btn-signup' type="submit">Signup</button>
        </Form>
      </Formik>
    </div>
    </>
  );
};

export default SignupForm;
