import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

/** ------------------------------------------------------------------
 *  Mock data – replace with real API look‑up in production
 *  ------------------------------------------------------------------ */
const GPN_DATA: { gpn: string; firstName: string; lastName: string }[] = [
  { gpn: 'GPN001', firstName: 'John', lastName: 'Doe' },
  { gpn: 'GPN002', firstName: 'Jane', lastName: 'Smith' },
  { gpn: 'GPN003', firstName: 'Arun', lastName: 'Kumar' },
];

/** ------------------------------------------------------------------
 *  Validation schema
 *  ------------------------------------------------------------------ */
const CreateMatterSchema = Yup.object({
  gpn: Yup.string().required('Required'),
  firstName: Yup.string().required('Required'),
  lastName: Yup.string().required('Required'),
  comment: Yup.string()
    .max(250, 'Comment can be at most 250 characters')
    .required('Required'),
});

/** ------------------------------------------------------------------
 *  Types
 *  ------------------------------------------------------------------ */
interface FormValues {
  gpn: string;
  firstName: string;
  lastName: string;
  comment: string;
}

/** ------------------------------------------------------------------
 *  Component
 *  ------------------------------------------------------------------ */
export default function CreateMatterForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const initialValues: FormValues = {
    gpn: '',
    firstName: '',
    lastName: '',
    comment: '',
  };

  /** --------------------------------------------------------------
   *  Helper – populate names from GPN
   *  -------------------------------------------------------------- */
  const handleGpnChange = (
    gpn: string,
    setFieldValue: (
      field: keyof FormValues,
      value: any,
      shouldValidate?: boolean
    ) => void
  ) => {
    const match = GPN_DATA.find((d) => d.gpn === gpn);
    if (match) {
      setFieldValue('firstName', match.firstName, false);
      setFieldValue('lastName', match.lastName, false);
    } else {
      setFieldValue('firstName', '', false);
      setFieldValue('lastName', '', false);
    }
  };

  const openTermsModal = () => {
    setTermsAccepted(false); // reset
    setIsModalOpen(true);
  };
  const closeTermsModal = () => setIsModalOpen(false);

  return (
    <div className="max-w-xl mx-auto p-6 grid gap-8">
      <h1 className="text-2xl font-semibold text-gray-800">Create Matter</h1>

      <Formik
        initialValues={initialValues}
        validationSchema={CreateMatterSchema}
        onSubmit={(values, { resetForm }) => {
          if (termsAccepted) {
            console.log('Successfully created matter', values);
            setSubmitSuccess(true);
            resetForm();
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
        }) => {
          /** ------------------------------------------------------
           *  Handlers within Formik context
           *  ------------------------------------------------------ */
          const handleCreateClick = () => {
            if (isValid && dirty) {
              openTermsModal();
            } else {
              submitForm(); // trigger built‑in validation messages
            }
          };

          const handleAcceptTerms = () => {
            setTermsAccepted(true);
            closeTermsModal();
            setTimeout(() => submitForm(), 0); // submit after modal closes
          };

          return (
            <>
              <Form className="grid gap-6">
                {/* GPN select */}
                <div className="grid gap-2">
                  <label
                    htmlFor="gpn"
                    className="font-medium text-sm flex items-center gap-1"
                  >
                    GPN <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gpn"
                    id="gpn"
                    value={values.gpn}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange(e);
                      handleGpnChange(val, setFieldValue);
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
                  <label
                    htmlFor="firstName"
                    className="font-medium text-sm flex items-center gap-1"
                  >
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
                    <span className="text-xs text-red-500">
                      {errors.firstName}
                    </span>
                  )}
                </div>

                {/* Last name */}
                <div className="grid gap-2">
                  <label
                    htmlFor="lastName"
                    className="font-medium text-sm flex items-center gap-1"
                  >
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
                    <span className="text-xs text-red-500">
                      {errors.lastName}
                    </span>
                  )}
                </div>

                {/* Comment */}
                <div className="grid gap-2">
                  <label
                    htmlFor="comment"
                    className="font-medium text-sm flex items-center gap-1"
                  >
                    Comment <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="comment"
                    id="comment"
                    rows={3}
                    value={values.comment}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="p-2 rounded-2xl shadow-md w-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.comment && touched.comment && (
                    <span className="text-xs text-red-500">
                      {errors.comment}
                    </span>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleCreateClick}
                  className="w-full bg-blue-600 text-white font-semibold py-2 rounded-2xl shadow-lg disabled:bg-gray-400 transition-opacity"
                  disabled={!dirty || !isValid}
                >
                  Create Matter
                </button>
              </Form>

              {/* Terms & Conditions Modal */}
              {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-opacity">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl grid gap-6 transform transition-all duration-300 scale-100">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Terms & Conditions
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed h-40 overflow-y-auto pr-2">
                      {/* Replace this placeholder with real terms. */}
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Integer nec odio. Praesent libero. Sed cursus ante dapibus
                      diam. Sed nisi. Nulla quis sem at nibh elementum
                      imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec
                      tellus sed augue semper porta. Mauris massa.
                    </p>
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => {
                          closeTermsModal();
                        }}
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
          );
        }}
      </Formik>
    </div>
  );
}
