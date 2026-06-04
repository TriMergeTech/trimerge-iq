function PersonModal({
  initialEmail = "",
  initialName = "",
  initialPositionId = "",
  isSaving = false,
  title,
  positions,
  onSave,
  onClose,
}: {
  initialEmail?: string;
  initialName?: string;
  initialPositionId?: string;
  isSaving?: boolean;
  title: string;
  positions?: PositionItem[];
  onSave: (payload: {
    name: string;
    email: string;
    positionId?: string;
  }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [positionId, setPositionId] = useState(initialPositionId);

  useEffect(() => {
    setName(initialName);
    setEmail(initialEmail);
    setPositionId(initialPositionId);
  }, [initialEmail, initialName, initialPositionId]);

  return (
    <BaseModal title={title} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            name: name.trim(),
            email: email.trim(),
            positionId: positionId || undefined,
          });
        }}
      >
        <ModalField label="Name">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={styles.formInput}
            required
            disabled={isSaving}
          />
        </ModalField>

        <ModalField label="Email">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={styles.formInput}
            required
            disabled={isSaving}
          />
        </ModalField>

        {positions && (
          <ModalField label="Position">
            <select
              value={positionId}
              onChange={(event) => setPositionId(event.target.value)}
              className={styles.formSelect}
              required
              disabled={isSaving}
            >
              <option value="">
                {positions.length > 0
                  ? "No position assigned"
                  : "Create a position first"}
              </option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.title}
                </option>
              ))}
            </select>
            {positions.length === 0 && (
              <p className={styles.hintText}>
                Positions created in `Position Management` will appear here
                automatically.
              </p>
            )}
          </ModalField>
        )}

        <ModalActions
          onClose={onClose}
          submitDisabled={isSaving}
          submitLabel={isSaving ? "Saving..." : "Save"}
        />
      </form>
    </BaseModal>
  );
}

function ClientModal({
  initialAbout = "",
  initialName = "",
  isSaving = false,
  title,
  onSave,
  onClose,
}: {
  initialAbout?: string;
  initialName?: string;
  isSaving?: boolean;
  title: string;
  onSave: (payload: Omit<ClientItem, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [about, setAbout] = useState(initialAbout);

  useEffect(() => {
    setName(initialName);
    setAbout(initialAbout);
  }, [initialAbout, initialName]);

  return (
    <BaseModal title={title} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ name: name.trim(), about: about.trim() });
        }}
      >
        <ModalField label="Name">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={styles.formInput}
            required
          />
        </ModalField>

        <ModalField label="About">
          <textarea
            value={about}
            onChange={(event) => setAbout(event.target.value)}
            rows={4}
            className={styles.formTextarea}
            required
          />
        </ModalField>

        <ModalActions
          onClose={onClose}
          submitDisabled={isSaving}
          submitLabel={isSaving ? "Saving..." : "Save"}
        />
      </form>
    </BaseModal>
  );
}

function ServiceModal({
  title,
  skills,
  positions,
  isSaving = false,
  onSave,
  onClose,
}: {
  title: string;
  skills: SkillItem[];
  positions: PositionItem[];
  isSaving?: boolean;
  onSave: (payload: Omit<ServiceItem, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedPositionIds, setSelectedPositionIds] = useState<string[]>([]);

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((current) =>
      current.includes(skillId)
        ? current.filter((item) => item !== skillId)
        : [...current, skillId],
    );
  };

  const togglePosition = (positionId: string) => {
    setSelectedPositionIds((current) =>
      current.includes(positionId)
        ? current.filter((item) => item !== positionId)
        : [...current, positionId],
    );
  };

  return (
    <BaseModal title={title} onClose={onClose} wide>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            name: name.trim(),
            description: description.trim(),
            skillIds: selectedSkillIds,
            positionIds: selectedPositionIds,
          });
        }}
      >
        <ModalField label="Title">
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

        <ModalField label="Skills">
          {skills.length > 0 ? (
            <div className={styles.checkboxGrid}>
              {skills.map((skill) => (
                <label key={skill.id} className={styles.checkPill}>
                  <input
                    type="checkbox"
                    checked={selectedSkillIds.includes(skill.id)}
                    onChange={() => toggleSkill(skill.id)}
                  />
                  <span>{skill.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className={styles.emptyHint}>
              No skills yet. Create skills first and they will appear here
              automatically.
            </p>
          )}
        </ModalField>

        <ModalField label="Positions">
          {positions.length > 0 ? (
            <div className={styles.checkboxGrid}>
              {positions.map((position) => (
                <label key={position.id} className={styles.checkPill}>
                  <input
                    type="checkbox"
                    checked={selectedPositionIds.includes(position.id)}
                    onChange={() => togglePosition(position.id)}
                  />
                  <span>{position.title}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className={styles.emptyHint}>
              No positions yet. Create positions first and they will appear here
              automatically.
            </p>
          )}
        </ModalField>

        <ModalActions
          onClose={onClose}
          submitDisabled={isSaving}
          submitLabel={isSaving ? "Saving..." : "Save"}
        />
      </form>
    </BaseModal>
  );
}

function PositionModal({
  title,
  skills,
  initialTitle = "",
  initialDescription = "",
  initialResponsibilities = [""],
  initialSkillIds = [],
  isSaving = false,
  onSave,
  onClose,
}: {
  title?: string;
  skills: SkillItem[];
  initialTitle?: string;
  initialDescription?: string;
  initialResponsibilities?: string[];
  initialSkillIds?: string[];
  isSaving?: boolean;
  onSave: (payload: Omit<PositionItem, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [positionTitle, setPositionTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [responsibilities, setResponsibilities] = useState<string[]>(
    initialResponsibilities.length > 0 ? initialResponsibilities : [""],
  );
  const [selectedSkillIds, setSelectedSkillIds] =
    useState<string[]>(initialSkillIds);

  const updateResponsibility = (index: number, value: string) => {
    setResponsibilities((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities((current) =>
      current.length === 1
        ? [""]
        : current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((current) =>
      current.includes(skillId)
        ? current.filter((item) => item !== skillId)
        : [...current, skillId],
    );
  };

  return (
    <BaseModal
      title={title ?? "Add New Position"}
      onClose={onClose}
      maxWidthClass="max-w-[760px]"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            title: positionTitle.trim(),
            description: description.trim(),
            responsibilities: responsibilities
              .map((item) => item.trim())
              .filter(Boolean),
            skillIds: selectedSkillIds,
          });
        }}
      >
        <ModalField label="Title">
          <input
            type="text"
            value={positionTitle}
            onChange={(event) => setPositionTitle(event.target.value)}
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

        <ModalField label="Responsibilities">
          <div>
            {responsibilities.map((responsibility, index) => (
              <div key={`responsibility-${index}`} className={styles.respRow}>
                <input
                  type="text"
                  value={responsibility}
                  onChange={(event) =>
                    updateResponsibility(index, event.target.value)
                  }
                  placeholder={`Responsibility ${index + 1}`}
                  className={styles.formInput}
                />
                <button
                  type="button"
                  onClick={() => removeResponsibility(index)}
                  className={styles.respRemove}
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setResponsibilities((current) => [...current, ""])}
              className={styles.addRespBtn}
            >
              + Add responsibility
            </button>
          </div>
        </ModalField>

        <ModalField label="Skills">
          {skills.length > 0 ? (
            <div className={styles.checkboxGrid}>
              {skills.map((skill) => (
                <label key={skill.id} className={styles.checkPill}>
                  <input
                    type="checkbox"
                    checked={selectedSkillIds.includes(skill.id)}
                    onChange={() => toggleSkill(skill.id)}
                  />
                  <span>{skill.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className={styles.emptyHint}>
              No skills yet. Create skills first and then link them to this
              position.
            </p>
          )}
        </ModalField>

        <ModalActions
          onClose={onClose}
          submitDisabled={isSaving}
          submitLabel={isSaving ? "Saving..." : "Save"}
        />
      </form>
    </BaseModal>
  );
}

function BaseModal({
  title,
  onClose,
  children,
  wide = false,
  maxWidthClass,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  maxWidthClass?: string;
}) {
  return (
    <div className={styles.modalOverlay}>
      <div
        className={
          wide || maxWidthClass
            ? `${styles.modal} ${styles.modalWide}`
            : styles.modal
        }
      >
        <div className={styles.modalHead}>
          <h3>{title}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}>
            <X />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function ModalField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>{label}</label>
      {children}
    </div>
  );
}

function ModalActions({
  onClose,
  submitDisabled = false,
  submitLabel = "Save",
}: {
  onClose: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
  return (
    <div className={styles.formActions}>
      <button type="button" onClick={onClose} className={styles.btnCancel}>
        Cancel
      </button>
      <button
        type="submit"
        disabled={submitDisabled}
        className={styles.btnSave}
      >
        {submitLabel}
      </button>
    </div>
  );
}

export {
  ModalActions,
  PersonModal,
  PositionModal,
  ClientModal,
  ModalField,
  ServiceModal,
  BaseModal,
};
