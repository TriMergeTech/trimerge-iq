import { useEffect, useState } from "react";
import styles from "./AdminPage.module.css";
import { BaseModal, ModalField, ModalActions } from "./AdminPrimitives";
import type { ClientItem, PositionItem, ServiceItem, SkillItem, StaffMember } from "./adminTypes";

export function PersonModal({
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
    fullname: string;
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
            fullname: name.trim(),
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
                <option key={position._id} value={position._id}>
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

export function PlatformModal({
  initialDescription = "",
  initialName = "",
  initialUrl = "",
  isSaving = false,
  title,
  nameLabel,
  onSave,
  onClose,
  submitLabel = "Save",
}: {
  initialDescription?: string;
  initialName?: string;
  initialUrl?: string;
  isSaving?: boolean;
  title: string;
  nameLabel: string;
  onSave: (payload: { name: string; url: string; description: string }) => void;
  onClose: () => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initialName);
  const [url, setUrl] = useState(initialUrl);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
    setUrl(initialUrl);
  }, [initialDescription, initialName, initialUrl]);

  return (
    <BaseModal title={title} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            name: name.trim(),
            url: url.trim(),
            description: description.trim(),
          });
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

        <ModalField label="URL">
          <input
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className={styles.formInput}
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

export type SkillPayload = {
  name: string;
  category: string;
  description: string;
  certificationIds: string[];
  staffMemberIds: string[];
  proficiencyLevel: string;
};

export type Certification = {
  id: string;
  name: string;
};

export function SkillModal({
  initialValues,
  certifications,
  staffMembers,
  isSaving = false,
  title,
  onSave,
  onClose,
  submitLabel = "Save",
}: {
  initialValues?: Partial<SkillPayload>;
  certifications: Certification[];
  staffMembers: StaffMember[];
  isSaving?: boolean;
  title: string;
  onSave: (payload: SkillPayload) => void;
  onClose: () => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );

  const [selectedCertifications, setSelectedCertifications] = useState<
    string[]
  >(initialValues?.certificationIds ?? []);

  const [proficiencyLevel, setProficiencyLevel] = useState(
    initialValues?.proficiencyLevel ?? "",
  );

  const [selectedStaffMembers, setSelectedStaffMembers] = useState<string[]>(
    initialValues?.staffMemberIds ?? [],
  );

  const toggleStaffMember = (staffId: string) => {
    setSelectedStaffMembers((current) =>
      current.includes(staffId)
        ? current.filter((id) => id !== staffId)
        : [...current, staffId],
    );
  };

  useEffect(() => {
    setName(initialValues?.name ?? "");
    setCategory(initialValues?.category ?? "");
    setDescription(initialValues?.description ?? "");
    setSelectedCertifications(initialValues?.certificationIds ?? []);
    setSelectedStaffMembers(initialValues?.staffMemberIds ?? []);
    setProficiencyLevel(initialValues?.proficiencyLevel ?? "");
  }, [initialValues]);

  const toggleCertification = (certificationId: string) => {
    setSelectedCertifications((current) =>
      current.includes(certificationId)
        ? current.filter((id) => id !== certificationId)
        : [...current, certificationId],
    );
  };

  return (
    <BaseModal title={title} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          onSave({
            name: name.trim(),
            category,
            description: description.trim(),
            certificationIds: selectedCertifications,
            staffMemberIds: selectedStaffMembers,
            proficiencyLevel,
          });
        }}
      >
        <ModalField label="Skill Name">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={styles.formInput}
            required
          />
        </ModalField>

        <ModalField label="Category">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={styles.formSelect}
            required
          >
            <option value="">Select Category</option>
            <option value="financial_management">Financial Management</option>
            <option value="consulting">Consulting</option>
            <option value="human_capital">Human Capital</option>
            <option value="technology">Technology</option>
            <option value="emergency_management">Emergency Management</option>
          </select>
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

        <ModalField label="Related Certifications">
          <div className={styles.checkboxGroup}>
            {certifications.map((certification) => (
              <label key={certification.id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedCertifications.includes(certification.id)}
                  onChange={() => toggleCertification(certification.id)}
                />
                {certification.name}
              </label>
            ))}
          </div>
        </ModalField>

        <ModalField label="Staff Members Possessing Skill">
          <div className={styles.checkboxGroup}>
            {staffMembers.map((staff) => (
              <label key={staff._id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedStaffMembers.includes(staff._id)}
                  onChange={() => toggleStaffMember(staff._id)}
                />
                &nbsp;{staff.fullname ?? staff.name}
              </label>
            ))}
          </div>
        </ModalField>

        <ModalField label="Proficiency Level">
          <select
            value={proficiencyLevel}
            onChange={(event) => setProficiencyLevel(event.target.value)}
            className={styles.formSelect}
            required
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
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

// Shared by RegistryModal and ClientModal, which are both just
// "name + one long text field" forms differing only in labels and
// the key their second field is saved under.
function SimpleTextModal({
  initialName = "",
  initialSecondField = "",
  nameLabel = "Name",
  secondFieldLabel,
  isSaving = false,
  title,
  onSave,
  onClose,
  submitLabel = "Save",
}: {
  initialName?: string;
  initialSecondField?: string;
  nameLabel?: string;
  secondFieldLabel: string;
  isSaving?: boolean;
  title: string;
  onSave: (payload: { name: string; secondField: string }) => void;
  onClose: () => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initialName);
  const [secondField, setSecondField] = useState(initialSecondField);

  useEffect(() => {
    setName(initialName);
    setSecondField(initialSecondField);
  }, [initialName, initialSecondField]);

  return (
    <BaseModal title={title} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ name: name.trim(), secondField: secondField.trim() });
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

        <ModalField label={secondFieldLabel}>
          <textarea
            value={secondField}
            onChange={(event) => setSecondField(event.target.value)}
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

export function RegistryModal({
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
  return (
    <SimpleTextModal
      title={title}
      nameLabel={nameLabel}
      secondFieldLabel="Description"
      initialName={initialName}
      initialSecondField={initialDescription}
      isSaving={isSaving}
      submitLabel={submitLabel}
      onClose={onClose}
      onSave={(payload) =>
        onSave({ name: payload.name, description: payload.secondField })
      }
    />
  );
}

export function ClientModal({
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
  onSave: (payload: Omit<ClientItem, "_id" | "createdAt">) => void;
  onClose: () => void;
}) {
  return (
    <SimpleTextModal
      title={title}
      secondFieldLabel="About"
      initialName={initialName}
      initialSecondField={initialAbout}
      isSaving={isSaving}
      onClose={onClose}
      onSave={(payload) =>
        onSave({ name: payload.name, about: payload.secondField })
      }
    />
  );
}

export function ServiceModal({
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
  onSave: (payload: Omit<ServiceItem, "_id" | "createdAt">) => void;
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
            title: name.trim(),
            description: description.trim(),
            skills: selectedSkillIds,
            positions: selectedPositionIds,
          } as Omit<ServiceItem, "_id" | "createdAt">);
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
                <label key={skill._id} className={styles.checkPill}>
                  <input
                    type="checkbox"
                    checked={selectedSkillIds.includes(skill._id)}
                    onChange={() => toggleSkill(skill._id)}
                  />
                  <span>{skill.title ?? skill.name}</span>
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
                <label key={position._id} className={styles.checkPill}>
                  <input
                    type="checkbox"
                    checked={selectedPositionIds.includes(position._id)}
                    onChange={() => togglePosition(position._id)}
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

export function PositionModal({
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
  onSave: (payload: Omit<PositionItem, "_id" | "createdAt">) => void;
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
      wide
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
                <label key={skill._id} className={styles.checkPill}>
                  <input
                    type="checkbox"
                    checked={selectedSkillIds.includes(skill._id)}
                    onChange={() => toggleSkill(skill._id)}
                  />
                  <span>{skill.title ?? skill.name}</span>
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
