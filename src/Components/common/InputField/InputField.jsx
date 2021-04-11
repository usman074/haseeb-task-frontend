import React from "react";
import { useField } from "formik";

export const InputField = ({ ...props }) => {
  const [field, meta] = useField(props);

  return (
    <>
      <input type="text" className="form-control" {...field} {...props} />
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
    </>
  );
};
