//Project
enum ProjectStatus {
  Active,
  Finished,
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Project State Manager
type Listener = (items: Project[]) => void;

class ProjectState {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }
  addProject(title: string, description: string, numbOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numbOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

//validate
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatebleInput: Validatable) {
  let isValid = true;
  if (validatebleInput.required) {
    isValid = isValid && validatebleInput.value.toString().trim().length !== 0;
  }
  if (
    validatebleInput.minLength != null &&
    typeof validatebleInput.value === "string"
  ) {
    isValid =
      isValid && validatebleInput.value.length >= validatebleInput.minLength;
  }
  if (
    validatebleInput.maxLength != null &&
    typeof validatebleInput.value === "string"
  ) {
    isValid =
      isValid && validatebleInput.value.length <= validatebleInput.maxLength;
  }
  if (
    validatebleInput.min != null &&
    typeof validatebleInput.value === "number"
  ) {
    isValid = isValid && validatebleInput.value >= validatebleInput.min;
  }
  if (
    validatebleInput.max != null &&
    typeof validatebleInput.value === "number"
  ) {
    isValid = isValid && validatebleInput.value <= validatebleInput.max;
  }
  return isValid;
}

// autobine decorator
function Autobine(_: any, _2: string, desctiprot: PropertyDescriptor) {
  const originalMethod = desctiprot.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      return originalMethod.bind(this);
    },
  };
  return adjDescriptor;
}

//Proect List Class
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assingProjects: Project[];

  constructor(private type: "active" | "finished") {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById("project-list")
    );
    this.hostElement = <HTMLDivElement>document.getElementById("app");
    this.assingProjects = [];

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = <HTMLElement>importedNode.firstElementChild;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: Project[]) => {
      const relevantPrj = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assingProjects = relevantPrj;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = <HTMLUListElement>(
      document.getElementById(`${this.type}-project-list`)
    );
    listEl.innerHTML = "";
    for (const prjItem of this.assingProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-project-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
}

// Component Base Class
class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById(templateId)
    );
    this.hostElement = <T>document.getElementById(hostElementId);
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = <U>importedNode.firstElementChild;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart);
  }
  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }
}

//Project Class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById("project-input")
    );
    this.hostElement = <HTMLDivElement>document.getElementById("app");

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = <HTMLFormElement>importedNode.firstElementChild;
    this.element.id = "user-input";

    this.titleInputElement = <HTMLInputElement>(
      this.element.querySelector("#title")
    );
    this.descriptionInputElement = <HTMLInputElement>(
      this.element.querySelector("#description")
    );
    this.peopleInputElement = <HTMLInputElement>(
      this.element.querySelector("#people")
    );

    this.configure();
    this.attach();
  }

  private gatherUserInput(): [string, string, number] | undefined {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const validateTitle = { value: enteredTitle, required: true, minLength: 5 };
    const validateDescr = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const validatePeople = { value: +enteredPeople, required: true };
    if (
      !validate(validateTitle) ||
      !validate(validateDescr) ||
      !validate(validatePeople)
    ) {
      alert("Invalid Input! Try Again!");
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
    this.titleInputElement.value = "";
  }

  @Autobine
  private submitHandler(event: Event) {
    event.preventDefault();
    const UserInput = this.gatherUserInput();
    if (Array.isArray(UserInput)) {
      const [title, descript, people] = UserInput;
      projectState.addProject(title, descript, people);
      this.clearInputs();
    }
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler.bind(this));
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const prjInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishProjectList = new ProjectList("finished");
