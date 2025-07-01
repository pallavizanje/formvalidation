import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Modal from "./ui/Modal";          // adjust import path as needed

/**********************************************************
 *  Mock async API helpers – replace with real endpoints.  *
 *********************************************************/
interface RegionResponse {
  item: string[];
}
interface NameOptionsResponse {
  item: string[];
}
interface TableEntry {
  id: number;
  name: string;
  lastname: string;
}
interface DetailsResponse {
  tablevalues: TableEntry[];
  details: string;
  country: string;
}

const mock = (<T,>(data: T, ms = 400) =>
  new Promise<T>((res) => setTimeout(() => res(data), ms)));


const fetchInstanceRegions = (): Promise<RegionResponse> =>
  mock({ item: ["A", "R", "C"] });

const fetchNameOptions = (region: string): Promise<NameOptionsResponse> => {
  const map: Record<string, string[]> = {
    A: ["item1", "item2", "item3"],
    R: ["item4", "item5"],
    C: ["item6"]
  };
  return mock({ item: map[region] || [] });
};

const fetchDetails = (name: string): Promise<DetailsResponse> =>
  mock({
    tablevalues: [
      { id: 1, name: "Pallavi", lastname: "Zanje" },
      { id: 2, name: "Amit", lastname: "Kumar" },
      { id: 3, name: "Anaya", lastname: "Kumar" }
    ],
    details: `details for ${name}`,
    country: "India"
  });

/**********************************************************
 *  Form types & validation                               *
 *********************************************************/
interface FormValues {
  instanceRegion: string;
  name: string;
  details: string;
  country: string;
  title: string;
  selectedPerson: string;
}

const schema = Yup.object({
  instanceRegion: Yup.string().required("Required"),
  name: Yup.string().required("Required"),
  title: Yup.string().min(5, "Min 5 characters").required("Required"),
  selectedPerson: Yup.string().required("Required")
});

/**********************************************************
 *  Component                                             *
 *********************************************************/
export default function CreateMatterForm() {
  /* fetched data */
  const [regions, setRegions] = useState<string[]>([]);
  const [nameOptions, setNameOptions] = useState<string[]>([]);
  const [tableValues, setTableValues] = useState<TableEntry[]>([]);

  /* UI state */
  const [showNameModal, setShowNameModal] = useState(false);
  const [showTcModal, setShowTcModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /* fetch regions on mount */
  useEffect(() => {
    fetchInstanceRegions().then((r) => setRegions(r.item));
  }, []);

  const initialValues: FormValues = {
    instanceRegion: "",
    name: "",
    details: "",
    country: "",
    title: "",
    selectedPerson: ""
  };

  return (
    <div className="max-w-3xl mx-auto p-6 grid gap-8">
      <h1 className="text-2xl font-semibold text-gray-800">Create Matter</h1>

      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={(values, { resetForm }) => {
          if (termsAccepted) {
            console.log("SUBMITTED", values);        // replace with real save
            setSubmitSuccess(true);
            resetForm();
            /* clear derived data */
            setTableValues([]);
            setNameOptions([]);
            setTermsAccepted(false);
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
          isValid,
          dirty,
          submitForm,
          resetForm
        }) => {
          /************************ helpers ************************/
          const clearSuccessAndChange: React.ChangeEventHandler<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          > = (e) => {
            setSubmitSuccess(false);
            handleChange(e);
          };

          const handleRegionChange = async (
            e: React.ChangeEvent<HTMLSelectElement>
          ) => {
            clearSuccessAndChange(e);
            /* reset downstream fields */
            setFieldValue("name", "");
            setFieldValue("details", "");
            setFieldValue("country", "");
            setFieldValue("selectedPerson", "");
            setTableValues([]);
            const opts = await fetchNameOptions(e.target.value);
            setNameOptions(opts.item);
          };

          const handleNameSelect = async (name: string) => {
            setSubmitSuccess(false);
            setFieldValue("name", name);
            setShowNameModal(false);
            const res = await fetchDetails(name);
            setTableValues(res.tablevalues);
            setFieldValue("details", res.details);
            setFieldValue("country", res.country);
          };

          const openTc = () => setShowTcModal(true);
          const acceptTc = () => {
            setTermsAccepted(true);
            setShowTcModal(false);
            submitForm();
          };

          const handleReset = () => {
            resetForm();
            setTableValues([]);
            setNameOptions([]);
            setShowNameModal(false);
            setShowTcModal(false);
            setTermsAccepted(false);
            setSubmitSuccess(false);
          };

          /************************ JSX ************************/
          return (
            <>
              <Form className="grid gap-6">
                {/* Instance Region */}
                <div className="grid gap-2">
                  <label
                    htmlFor="instanceRegion"
                    className="text-sm font-medium flex gap-1 items-center"
                  >
                    Instance Region <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="instanceRegion"
                    name="instanceRegion"
                    value={values.instanceRegion}
                    onChange={handleRegionChange}
                    onBlur={handleBlur}
                    className="p-2 border rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Select region
                    </option>
                    {regions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {errors.instanceRegion && touched.instanceRegion && (
                    <p className="text-xs text-red-500">
                      {errors.instanceRegion}
                    </p>
                  )}
                </div>

                {/* Name (search field) */}
                <div className="grid gap-2 relative">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium flex gap-1 items-center"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={values.name}
                    readOnly
                    className="p-2 pr-10 border rounded-2xl w-full bg-gray-100 cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNameModal(true)}
                    disabled={!values.instanceRegion}
                    className="absolute right-3 top-[42px] text-gray-600 hover:text-gray-800 disabled:opacity-30"
                  >
                    {/* magnifying glass */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-5 h-5"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </button>
                  {errors.name && touched.name && (
                    <p className="text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Details & Country (disabled) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Details</label>
                    <input
                      type="text"
                      name="details"
                      value={values.details}
                      readOnly
                      className="p-2 border rounded-2xl w-full bg-gray-100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={values.country}
                      readOnly
                      className="p-2 border rounded-2xl w-full bg-gray-100"
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="grid gap-2">
                  <label
                    htmlFor="title"
                    className="text-sm font-medium flex gap-1 items-center"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={values.title}
                    onChange={clearSuccessAndChange}
                    onBlur={handleBlur}
                    className="p-2 border rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.title && touched.title && (
                    <p className="text-xs text-red-500">{errors.title}</p>
                  )}
                </div>

                {/* Dropdown of table names */}
                <div className="grid gap-2">
                  <label
                    htmlFor="selectedPerson"
                    className="text-sm font-medium flex gap-1 items-center"
                  >
                    Select Person <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="selectedPerson"
                    name="selectedPerson"
                    value={values.selectedPerson}
                    disabled={tableValues.length === 0}
                    onChange={clearSuccessAndChange}
                    onBlur={handleBlur}
                    className="p-2 border rounded-2xl w-full disabled:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      {tableValues.length ? "Select one" : "No data"}
                    </option>
                    {tableValues.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {errors.selectedPerson && touched.selectedPerson && (
                    <p className="text-xs text-red-500">
                      {errors.selectedPerson}
                    </p>
                  )}
                </div>

                {/* Table view */}
                {tableValues.length > 0 && (
                  <div className="overflow-x-auto rounded-2xl shadow-md">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">ID</th>
                          <th className="px-4 py-2 text-left font-medium">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left font-medium">
                            Last Name
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {tableValues.map((row) => (
                          <tr key={row.id}>
                            <td className="px-4 py-2">{row.id}</td>
                            <td className="px-4 py-2">{row.name}</td>
                            <td className="px-4 py-2 capitalize">
                              {row.lastname}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (isValid && dirty) {
                        setTermsAccepted(false);
                        openTc();
                      } else {
                        submitForm();
                      }
                    }}
                    className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-2xl shadow-lg disabled:bg-gray-400 transition-opacity"
                    disabled={!isValid || !dirty}
                  >
                    Create Matter
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded-2xl shadow-inner hover:bg-gray-400 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </Form>

              {/* Success banner */}
              {submitSuccess && (
                <div className="text-green-600 font-medium text-center">
                  Submission complete – matter created successfully!
                </div>
              )}

              {/* -------- Name Modal -------- */}
              <Modal
                open={showNameModal}
                onClose={() => setShowNameModal(false)}
                size="max-w-sm"
              >
                <h2 className="text-lg font-semibold mb-4">Select Name</h2>

                <ul className="grid gap-2 max-h-60 overflow-y-auto pr-2">
                  {nameOptions.map((n) => (
                    <li key={n}>
                      <button
                        type="button"
                        onClick={() => handleNameSelect(n)}
                        className="w-full text-left px-4 py-2 rounded-2xl hover:bg-blue-50"
                      >
                        {n}
                      </button>
                    </li>
                  ))}
                  {nameOptions.length === 0 && (
                    <li className="text-sm text-gray-500">No options</li>
                  )}
                </ul>

                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
                  className="mt-6 px-4 py-2 bg-gray-200 rounded-2xl hover:bg-gray-300"
                >
                  Close
                </button>
              </Modal>

              {/* ---- Terms & Conditions Modal ---- */}
              <Modal open={showTcModal} onClose={() => setShowTcModal(false)}>
                <h2 className="text-xl font-semibold mb-4">
                  Terms &amp; Conditions
                </h2>

                <p className="text-sm text-gray-600 h-40 overflow-y-auto pr-2">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Ipsum eveniet minus est ad ab officia!
                </p>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowTcModal(false)}
                    className="px-4 py-2 bg-red-500 text-white rounded-2xl hover:bg-red-600"
                  >
                    Reject
                  </button>
                  <button
                    onClick={acceptTc}
                    className="px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700"
                  >
                    Accept
                  </button>
                </div>
              </Modal>
            </>
          );
        }}
      </Formik>
    </div>
  );
}
