
import React, { useState } from 'react';
import { CustomInput, CustomButton } from '../components';
import styles from '../styles';
import { sendTreatmentPlanRequest } from '../utils/onboard';

const CreateTreatmentPlanRequest = () => {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    dateOfBirth: '',
    gender: '',
    area: '',
    menu: '',
    description: '',
    images: null,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateEmail = (email) => {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      setErrorMessage('Invalid email address.');
      return;
    }
    try {
      await sendTreatmentPlanRequest(formData);
      setSuccessMessage('Treatment plan request sent successfully.');
      setFormData({
        email: '',
        displayName: '',
        dateOfBirth: '',
        gender: '',
        area: '',
        menu: '',
        description: '',
        images: null,
      });
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className={styles.hocBodyWrapper}>
      <form onSubmit={handleSubmit}>
        <CustomInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
        <CustomInput
          label="Display Name"
          name="displayName"
          type="text"
          value={formData.displayName}
          onChange={handleChange}
        />
        <CustomInput
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
        />
        <CustomInput
          label="Gender"
          name="gender"
          type="text"
          value={formData.gender}
          onChange={handleChange}
        />
        <CustomInput
          label="Area"
          name="area"
          type="text"
          value={formData.area}
          onChange={handleChange}
        />
        <CustomInput
          label="Menu"
          name="menu"
          type="text"
          value={formData.menu}
          onChange={handleChange}
        />
        <CustomInput
          label="Description"
          name="description"
          type="text"
          value={formData.description}
          onChange={handleChange}
        />
        <CustomInput
          label="Images"
          name="images"
          type="file"
          onChange={handleChange}
        />
        <CustomButton type="submit">Submit</CustomButton>
      </form>
      {successMessage && <div className={styles.success}>{successMessage}</div>}
      {errorMessage && <div className={styles.failure}>{errorMessage}</div>}
    </div>
  );
};

export default CreateTreatmentPlanRequest;
