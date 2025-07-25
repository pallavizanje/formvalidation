import React, { useRef, useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";

// Mock GPN data
const GPN_DATA = [{ gpn: "GPN001" }, { gpn: "GPN002" }];

interface FormValues {
  gpn: string;
  firstName: string;
  lastName: string;
  comment: string;
}

const initialValues: FormValues = {
  gpn: "",
  firstName: "Pallavi",
  lastName: "Zanje",
  comment: "",
};

const CreateMatterSchema = Yup.object().shape({
  gpn: Yup.string().required("GPN is required"),
  comment: Yup.string().required("Comment is required"),
});

const CreateMatterForm: React.FC = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formikHelpersRef = useRef<FormikHelpers<FormValues> | null>(null);

  const handleGpnChange = (
    val: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setFieldValue("gpn", val);
  };

  const handleCreateClick = (
    isValid: boolean,
    dirty: boolean,
    submitForm: () => void
  ) => {
    if (isValid && dirty) {
      setIsModalOpen(true);
    } else {
      submitForm();
    }
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setIsModalOpen(false);
    setTimeout(() => formikHelpersRef.current?.submitForm(), 0);
  };

  const handleReset = (resetForm: () => void) => {
    resetForm();
    setSubmitSuccess(false);
    setTermsAccepted(false);
  };

  const handleWrappedChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    handleChange: (e: React.ChangeEvent<any>) => void
  ) => {
    setSubmitSuccess(false);
    handleChange(e);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CreateMatterSchema}
      onSubmit={(values, helpers) => {
        formikHelpersRef.current = helpers;
        if (termsAccepted) {
          console.log("Successfully created matter", values);
          setSubmitSuccess(true);
          helpers.resetForm();
          setTermsAccepted(false);
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        isValid,
        dirty,
        handleChange,
        handleBlur,
        setFieldValue,
        submitForm,
        resetForm,
      }) => (
        <>
          <Form className="grid gap-6">
            {/* GPN select */}
            <div className="grid gap-2">
              <label htmlFor="gpn" className="font-medium text-sm flex items-center gap-1">
                GPN <span className="text-red-500">*</span>
              </label>
              <select
                name="gpn"
                id="gpn"
                value={values.gpn}
                onChange={(e) => {
                  handleWrappedChange(e, handleChange);
                  handleGpnChange(e.target.value, setFieldValue);
                }}
                onBlur={handleBlur}
                className="p-2 rounded-2xl shadow-md w-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select GPN
                </option>
                {GPN_DATA.map((d) => (
                  <option key={d.gpn} value={d.gpn}>
                    {d.gpn}
                  </option>
                ))}
              </select>
              {errors.gpn && touched.gpn && (
                <span className="text-xs text-red-500">{errors.gpn}</span>
              )}
            </div>

            {/* First name */}
            <div className="grid gap-2">
              <label htmlFor="firstName" className="font-medium text-sm flex items-center gap-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                id="firstName"
                type="text"
                value={values.firstName}
                readOnly
                className="p-2 rounded-2xl shadow-md w-full border bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              {errors.firstName && touched.firstName && (
                <span className="text-xs text-red-500">{errors.firstName}</span>
              )}
            </div>

            {/* Last name */}
            <div className="grid gap-2">
              <label htmlFor="lastName" className="font-medium text-sm flex items-center gap-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                name="lastName"
                id="lastName"
                type="text"
                value={values.lastName}
                readOnly
                className="p-2 rounded-2xl shadow-md w-full border bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              {errors.lastName && touched.lastName && (
                <span className="text-xs text-red-500">{errors.lastName}</span>
              )}
            </div>

            {/* Comment */}
            <div className="grid gap-2">
              <label htmlFor="comment" className="font-medium text-sm flex items-center gap-1">
                Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                name="comment"
                id="comment"
                rows={3}
                value={values.comment}
                onChange={(e) => handleWrappedChange(e, handleChange)}
                onBlur={handleBlur}
                className="p-2 rounded-2xl shadow-md w-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.comment && touched.comment && (
                <span className="text-xs text-red-500">{errors.comment}</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleCreateClick(isValid, dirty, submitForm)}
                className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-2xl shadow-lg disabled:bg-gray-400 transition-opacity"
                disabled={!dirty || !isValid}
              >
                Create Matter
              </button>
              <button
                type="button"
                onClick={() => handleReset(resetForm)}
                className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded-2xl shadow-inner hover:bg-gray-400 transition-colors"
              >
                Reset
              </button>
            </div>
          </Form>

          {/* Terms & Conditions Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-opacity">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl grid gap-6 transform transition-all duration-300 scale-100">
                <h2 className="text-xl font-semibold text-gray-800">
                  Terms & Conditions
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed h-40 overflow-y-auto pr-2">
                  {/* Placeholder terms */}
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Fusce nec tellus sed augue semper porta.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-2xl bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleAcceptTerms}
                    className="px-4 py-2 rounded-2xl bg-green-600 text-white shadow-md hover:bg-green-700 transition-colors"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          )}

          {submitSuccess && (
            <div className="text-center text-green-600 font-medium mt-4">
              Submission complete – matter created successfully!
            </div>
          )}
        </>
      )}
    </Formik>
  );
};

export default CreateMatterForm;

onSubmit={(values, helpers) => {
  formikHelpersRef.current = helpers;
  if (termsAccepted) {
    console.log("Successfully created matter", values);
    toast.success("Matter created successfully!");
    setSubmitSuccess(true);
    helpers.resetForm();
    setTermsAccepted(false);
  }
}}

