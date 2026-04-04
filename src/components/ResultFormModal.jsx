export default function ResultFormModal({ isOpen, onClose, onSubmit, tests, students }) {
  const [form, setForm] = useState({
    student_id: "",
    test_id: "",
    score: "",
    rank: ""
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96 space-y-4">

        <h2 className="font-semibold">Upload Result</h2>

        <select onChange={e => setForm({...form, student_id: e.target.value})}>
          <option>Select Student</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select onChange={e => setForm({...form, test_id: e.target.value})}>
          <option>Select Test</option>
          {tests.map(t => (
            <option key={t.id} value={t.id}>{t.test_name}</option>
          ))}
        </select>

        <input
          placeholder="Score"
          onChange={e => setForm({...form, score: e.target.value})}
        />

        <input
          placeholder="Rank"
          onChange={e => setForm({...form, rank: e.target.value})}
        />

        <div className="flex gap-2">
          <button onClick={() => onSubmit(form)} className="bg-green-600 text-white px-3 py-1">
            Submit
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>

      </div>
    </div>
  );
}