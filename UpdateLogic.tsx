import React, { useState } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";

interface FormValues {
  region: string;
  name: string;
  details: string;
  country: string;
  selectedPerson: string;
}

const initialValues: FormValues = {
  region: "",
  name: "",
  details: "",
  country: "",
  selectedPerson: "",
};

const validationSchema = Yup.object({
  region: Yup.string().required("Region is required"),
  name: Yup.string().required("Name is required"),
  details: Yup.string().required("Details are required"),
  country: Yup.string().required("Country is required"),
  selectedPerson: Yup.string().required("Person is required"),
});

const CreateMatterForm = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [tableValues, setTableValues] = useState<any[]>([]);
  const [nameOptions, setNameOptions] = useState<any[]>([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showTcModal, setShowTcModal] = useState(false);

  // Mock async functions
  const fetchNameOptions = async (region: string) => {
    return { item: [{ name: "John" }, { name: "Jane" }] };
  };

  const fetchDetails = async (name: string) => {
    return {
      tablevalues: [{ id: 1, value: "Data" }],
      details: "Some Details",
      country: "India",
    };
  };

  const handleRegionChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const region = e.target.value;
    setSubmitSuccess(false);
    setFieldValue("region", region);
    setFieldValue("name", "");
    setFieldValue("details", "");
    setFieldValue("country", "");
    setFieldValue("selectedPerson", "");
    setTableValues([]);
    const opts = await fetchNameOptions(region);
    setNameOptions(opts.item);
  };

  const handleNameSelect = async (
    name: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setSubmitSuccess(false);
    setFieldValue("name", name);
    setShowNameModal(false);
    const res = await fetchDetails(name);
    setTableValues(res.tablevalues);
    setFieldValue("details", res.details);
    setFieldValue("country", res.country);
  };

  const handleReset = (
    resetForm: () => void,
    setFieldValue: (field: string, value: any) => void
  ) => {
    resetForm();
    setTableValues([]);
    setNameOptions([]);
    setShowNameModal(false);
    setShowTcModal(false);
    setTermsAccepted(false);
    setSubmitSuccess(false);
    setFieldValue("region", "");
  };

  const handleCreateClick = (
    isValid: boolean,
    dirty: boolean,
    submitForm: () => void
  ) => {
    if (isValid && dirty) {
      setTermsAccepted(false);
      setShowTcModal(true);
    } else {
      submitForm();
    }
  };

  const handleAcceptTerms = (submitForm: () => void) => {
    setTermsAccepted(true);
    setShowTcModal(false);
    submitForm();
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
        if (termsAccepted) {
          console.log("Successfully submitted:", values);
          setSubmitSuccess(true);
          handleReset(resetForm, () => {});
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        setFieldValue,
        handleChange,
        handleBlur,
        resetForm,
        submitForm,
        isValid,
        dirty,
      }) => (
        <form className="space-y-4 p-4" onSubmit={(e) => e.preventDefault()}>
          {/* Region */}
          <div>
            <label>Region</label>
            <select
              name="region"
              value={values.region}
              onChange={(e) => handleRegionChange(e, setFieldValue)}
              onBlur={handleBlur}
              className="border p-1"
            >
              <option value="">Select</option>
              <option value="NA">North America</option>
              <option value="EU">Europe</option>
            </select>
            {touched.region && errors.region && (
              <div className="text-red-500">{errors.region}</div>
            )}
          </div>

          {/* Name */}
          <div>
            <label>Name</label>
            <div className="flex gap-2">
              <input
                name="name"
                value={values.name}
                readOnly
                className="border p-1"
              />
              <button
                type="button"
                onClick={() => setShowNameModal(true)}
                className="border px-2"
              >
                Search
              </button>
            </div>
            {touched.name && errors.name && (
              <div className="text-red-500">{errors.name}</div>
            )}
          </div>

          {/* Details */}
          <div>
            <label>Details</label>
            <input
              name="details"
              value={values.details}
              readOnly
              className="border p-1"
            />
            {touched.details && errors.details && (
              <div className="text-red-500">{errors.details}</div>
            )}
          </div>

          {/* Country */}
          <div>
            <label>Country</label>
            <input
              name="country"
              value={values.country}
              readOnly
              className="border p-1"
            />
            {touched.country && errors.country && (
              <div className="text-red-500">{errors.country}</div>
            )}
          </div>

          {/* Selected Person */}
          <div>
            <label>Selected Person</label>
            <input
              name="selectedPerson"
              value={values.selectedPerson}
              onChange={handleChange}
              onBlur={handleBlur}
              className="border p-1"
            />
            {touched.selectedPerson && errors.selectedPerson && (
              <div className="text-red-500">{errors.selectedPerson}</div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleCreateClick(isValid, dirty, submitForm)}
              className="border px-4"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => handleReset(resetForm, setFieldValue)}
              className="border px-4"
            >
              Reset
            </button>
          </div>

          {/* Success */}
          {submitSuccess && (
            <div className="text-green-600">Form submitted successfully!</div>
          )}

          {/* Name Modal */}
          {showNameModal && (
            <div className="modal">
              <div className="modal-content">
                <h2>Select a Name</h2>
                <ul>
                  {nameOptions.map((n: any, idx: number) => (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => handleNameSelect(n.name, setFieldValue)}
                      >
                        {n.name}
                      </button>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setShowNameModal(false)}>Close</button>
              </div>
            </div>
          )}

          {/* Terms Modal */}
          {showTcModal && (
            <div className="modal">
              <div className="modal-content">
                <h2>Terms and Conditions</h2>
                <p>You must accept the terms before submitting.</p>
                <button onClick={() => handleAcceptTerms(submitForm)}>Accept</button>
                <button onClick={() => setShowTcModal(false)}>Decline</button>
              </div>
            </div>
          )}
        </form>
      )}
    </Formik>
  );
};

export default CreateMatterForm;
