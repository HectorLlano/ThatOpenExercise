import * as OBC from "openbim-components"

interface ToDo {
    description: string,
    date: Date,
    fragmentMap: OBC.FragmentIdMap
}

export class TodoCreator extends OBC.Component<ToDo[]> implements OBC.UI{

    static uuid = "7aafe9e4-b563-4010-936a-b6b267524d56"

    enabled = true
    uiElement = new OBC.UIElement<{
        activationButton: OBC.Button,
        todoList: OBC.FloatingWindow
    }>()

    private _components: OBC.Components
    private _list: ToDo[] = []

    constructor(components: OBC.Components) {
        super(components)
        this._components = components
        components.tools.add(TodoCreator.uuid, this)
        this.setUI()
    }

    async addTodo(description: string) {
        const highlighter = await this._components.tools.get(OBC.FragmentHighlighter)
        const todo: ToDo = {
            description,
            date: new Date(),
            fragmentMap: highlighter.selection.select
        }
        console.log(todo)
    }

    private setUI(){
        const activationButton = new OBC.Button(this._components)
        activationButton.materialIcon = "construction"

        const newTodoBtn = new OBC.Button(this._components, {name: "Create"})
        activationButton.addChild(newTodoBtn)

        const form = new OBC.Modal(this._components)
        this._components.ui.add(form)
        form.title = "Create New ToDo"

        const descriptionInput = new OBC.TextArea(this._components)
        descriptionInput.label = "Description"
        form.slots.content.addChild(descriptionInput)

        form.slots.content.get().style.padding = "20px"
        form.slots.content.get().style.display = "flex"
        form.slots.content.get().style.flexDirection = "column"
        form.slots.content.get().style.rowGap = "20px"

        form.onAccept.add(() => {
            this.addTodo(descriptionInput.value)
        })
        
        form.onCancel.add(() => form.visible = false)

        newTodoBtn.onClick.add(() => form.visible = true)
        
        const todoList = new OBC.FloatingWindow(this._components)
        this._components.ui.add(todoList)
        todoList.visible = false
        todoList.title = "To-Do List"
        
        const todoListBtn = new OBC.Button(this._components, {name: "List"})
        activationButton.addChild(todoListBtn)
        todoListBtn.onClick.add(() => {todoList.visible = !todoList.visible})
        
        this.uiElement.set({activationButton, todoList})
    }

    get(): ToDo[] {
        return this._list
    }
}