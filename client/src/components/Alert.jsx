import React from "react";

import { AlertIcon } from "../assets";
import styles from "../styles";

const Alert = ({ message, type }) => {
  return (
    <div className={`${styles.alert} ${styles.flexCenter}`}>
      <div className={`${styles.alertWrapper} ${styles[type]}`}>
        <AlertIcon type={type}></AlertIcon>
        {message}
      </div>
    </div>
  );
};

export default Alert;
