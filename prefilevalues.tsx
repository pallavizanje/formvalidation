import React, { useEffect, useState } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";

/** ------------ Types ------------- */
interface FormValues {
  region: string;
  name: string;
  details: string;
  country: string;
  selectedPerson: string;
}

/** ------------ Mock APIs (replace with real endpoints) ------------- */
const mock = <T,>(data: T, ms = 400) =>
  new Promise<T>((res) => setTimeout(() => res(data), ms));

const fetchNameOptions = async (region: string) =>
  mock<{ item: { name: string }[] }>(
    region === "EU"
      ? { item: [{ name: "Jane" }, { name: "John" }] }
      : region === "NA"
      ? { item: [{ name: "Alice" }, { name: "Bob" }] }
      : { item: [] }
  );

const fetchDetails = async (name: string) =>
  mock({
    tablevalues: [{ id: 1, value: "Row1" }, { id: 2, value: "Row2" }],
    details: `Details for ${name}`,
    country: "India",
  });

/** Example: prefill coming from API (e.g., deep link or draft) */
const fetchInitialFormData = async (): Promise<Partial<FormValues>> =>
  mock<Partial<FormValues>>({
    region: "EU",
    name: "Jane",
    // details/country can also come from API; if omitted, we’ll derive after fetching details
  });

/** ------------ Validation ------------- */
const validationSchema = Yup.object({
  region: Yup.string().required("Region is required"),
  name: Yup.string().required("Name is required"),
  details: Yup.string().required("Details are required"),
  country: Yup.string().required("Country is required"),
  selectedPerson: Yup.string().required("Person is required"),
});

/** ------------ Component ------------- */
const CreateMatterForm = () => {
  const pristineInitial: FormValues = {
    region: "",
    name: "",
    details: "",
    country: "",
    selectedPerson: "",
  };

  const [formInit, setFormInit] = useState<FormValues>(pristineInitial);
  const [initLoaded, setInitLoaded] = useState(false);

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [tableValues, setTableValues] = useState<any[]>([]);
  const [nameOptions, setNameOptions] = useState<{ name: string }[]>([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showTcModal, setShowTcModal] = useState(false);

  /** --------- Load initial values from API and hydrate dependent data ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const prefill = await fetchInitialFormData(); // e.g., { region: 'EU', name: 'Jane' }
        // Start from a clean base and merge prefill
        let nextInit: FormValues = { ...pristineInitial, ...prefill };

        // If region is available, load name options for that region
        if (prefill.region) {
          const opts = await fetchNameOptions(prefill.region);
          setNameOptions(opts.item);
        }

        // If name is available (either from API or user’s draft), load details & table
        if (prefill.name) {
          const res = await fetchDetails(prefill.name);
          setTableValues(res.tablevalues);
          nextInit = {
            ...nextInit,
            details: res.details ?? nextInit.details,
            country: res.country ?? nextInit.country,
          };
        }

        setFormInit(nextInit);
      } finally {
        setInitLoaded(true);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** --------- Handlers (kept above return) ---------- */
  const handleRegionChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const region = e.target.value;
    setSubmitSuccess(false);

    // Update region and clear downstream fields
    setFieldValue("region", region);
    setFieldValue("name", "");
    setFieldValue("details", "");
    setFieldValue("country", "");
    setFieldValue("selectedPerson", "");
    setTableValues([]);

    // Load name options for the picked region
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

  if (!initLoaded) {
    return <div className="p-4 text-gray-600">Loading…</div>;
  }

  return (
    <Formik
      initialValues={formInit}
      enableReinitialize  // <-- important to apply API-loaded values
      validationSchema={validationSchema}
      validateOnMount
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
            <label className="block mb-1">Region</label>
            <select
              name="region"
              value={values.region}
              onChange={(e) => handleRegionChange(e, setFieldValue)}
              onBlur={handleBlur}
              className="border p-2 rounded"
            >
              <option value="">Select</option>
              <option value="EU">Europe</option>
              <option value="NA">North America</option>
            </select>
            {touched.region && errors.region && (
              <div className="text-red-500 text-sm mt-1">{errors.region}</div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block mb-1">Name</label>
            <div className="flex gap-2">
              <input
                name="name"
                value={values.name}
                readOnly
                className="border p-2 rounded flex-1 bg-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowNameModal(true)}
                disabled={!values.region}
                className="border px-3 py-2 rounded disabled:opacity-50"
              >
                Search
              </button>
            </div>
            {touched.name && errors.name && (
              <div className="text-red-500 text-sm mt-1">{errors.name}</div>
            )}
          </div>

          {/* Details */}
          <div>
            <label className="block mb-1">Details</label>
            <input
              name="details"
              value={values.details}
              readOnly
              className="border p-2 rounded w-full bg-gray-100"
            />
            {touched.details && errors.details && (
              <div className="text-red-500 text-sm mt-1">{errors.details}</div>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block mb-1">Country</label>
            <input
              name="country"
              value={values.country}
              readOnly
              className="border p-2 rounded w-full bg-gray-100"
            />
            {touched.country && errors.country && (
              <div className="text-red-500 text-sm mt-1">{errors.country}</div>
            )}
          </div>

          {/* Selected Person */}
          <div>
            <label className="block mb-1">Selected Person</label>
            <input
              name="selectedPerson"
              value={values.selectedPerson}
              onChange={handleChange}
              onBlur={handleBlur}
              className="border p-2 rounded w-full"
            />
            {touched.selectedPerson && errors.selectedPerson && (
              <div className="text-red-500 text-sm mt-1">
                {errors.selectedPerson}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleCreateClick(isValid, dirty, submitForm)}
              className="border px-4 py-2 rounded"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => handleReset(resetForm, setFieldValue)}
              className="border px-4 py-2 rounded"
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
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
              <div className="bg-white p-4 rounded w-full max-w-sm">
                <h2 className="text-lg font-semibold mb-3">Select a Name</h2>
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {nameOptions.map((n, idx) => (
                    <li key={`${n.name}-${idx}`}>
                      <button
                        type="button"
                        onClick={() => handleNameSelect(n.name, setFieldValue)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                      >
                        {n.name}
                      </button>
                    </li>
                  ))}
                  {nameOptions.length === 0 && (
                    <li className="text-sm text-gray-500">No options</li>
                  )}
                </ul>
                <div className="mt-4 text-right">
                  <button
                    type="button"
                    onClick={() => setShowNameModal(false)}
                    className="border px-3 py-2 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Terms Modal */}
          {showTcModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
              <div className="bg-white p-4 rounded w-full max-w-md">
                <h2 className="text-lg font-semibold mb-3">Terms & Conditions</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Please accept the terms and conditions to proceed.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTcModal(false)}
                    className="border px-3 py-2 rounded"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAcceptTerms(submitForm)}
                    className="border px-3 py-2 rounded"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </Formik>
  );
};

export default CreateMatterForm;
