function RegistryModal({
  initialDescription = "",
  initialName = "",
  isSaving = false,
  title,
  nameLabel,
  onSave,
  onClose,
  submitLabel = "Save",
}: {
  initialDescription?: string;
  initialName?: string;
  isSaving?: boolean;
  title: string;
  nameLabel: string;
  onSave: (payload: { name: string; description: string }) => void;
  onClose: () => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
  }, [initialDescription, initialName]);

  return (
    <BaseModal title={title} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ name: name.trim(), description: description.trim() });
        }}
      >
        <ModalField label={nameLabel}>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={styles.formInput}
            required
          />
        </ModalField>

        <ModalField label="Description">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className={styles.formTextarea}
            required
          />
        </ModalField>

        <ModalActions
          onClose={onClose}
          submitDisabled={isSaving}
          submitLabel={isSaving ? "Saving..." : submitLabel}
        />
      </form>
    </BaseModal>
  );
}

export default RegistryModal;
