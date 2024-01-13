import * as OBC from "openbim-components"

export class SimpleQTO extends OBC.Component<null> implements OBC.UI, OBC.Disposable {
    static uuid = "923c5407-21c4-4bd2-b05e-7731a488ea2b"
    enabled = true;
    private _components: OBC.Components
    uiElement = new OBC.UIElement<{
        activationBtn: OBC.Button;
        qtoList: OBC.FloatingWindow;
    }>;

    constructor (components: OBC.Components) {
        super(components)
        this._components = components
        this.setUI()
    }
    
    private setUI() {
        const activationBtn = new OBC.Button(this._components)
        activationBtn.materialIcon = "functions"

        const qtoList = new OBC.FloatingWindow(this._components)
        qtoList.title = "Quantification"
        this._components.ui.add(qtoList)
        qtoList.visible = false

        activationBtn.onClick.add(() => {
            activationBtn.active = !activationBtn.active
            qtoList.visible = activationBtn.active
        })

        this.uiElement.set({activationBtn, qtoList})
    }

    sumQuantities(fragmentIdMap: OBC.FragmentIdMap) {
        
    }

    async dispose () {
        this.uiElement.dispose()
    };
    
    get(): null {
        return null;
    }
}