<template>
    <span class="el-cascader multi-cascader"
        :class="[
      {
        'is-opened': menuVisible,
        'is-disabled': cascaderDisabled
      },
      cascaderSize ? 'el-cascader--' + cascaderSize : ''
    ]"
        @click="handleClick"
        @mouseenter="inputHover = true"
        @focus="inputHover = true"
        @mouseleave="inputHover = false"
        @blur="inputHover = false"
        ref="reference"
        v-clickoutside="handleClickoutside"
        @keydown="handleKeydown">
        <el-input ref="input"
        class="multi-base-input"
            :readonly="readonly"
            :placeholder="currentLabels.length ? undefined : placeholder"
            v-model="inputValue"
            @input="debouncedInputChange"
            @focus="handleFocus"
            @blur="handleBlur"
            @compositionstart.native="handleComposition"
            @compositionend.native="handleComposition"
            :validate-event="false"
            :size="size"
            :disabled="cascaderDisabled"
            :class="{ 'is-focus': menuVisible }">
            <template slot="suffix">
                <i key="1"
                    v-if="clearable && inputHover && currentLabels.length"
                    class="el-input__icon el-icon-circle-close el-cascader__clearIcon"
                    @click="clearValue"></i>
                <i key="2"
                    v-else
                    class="el-input__icon el-icon-arrow-down"
                    :class="{ 'is-reverse': menuVisible }"></i>
            </template>
        </el-input>
        <span class="el-cascader__label"
            v-show="(!multiple && inputValue === '' && !isOnComposition) || (multiple)"
            ref="tags"
            :style="{ 'max-width': inputWidth - 32 + 'px', width: '100%' }"
            :class="[
        {
          'el-multicascader__label': multiple,
        },
      ]">
            <template v-if="multiple">
                <span v-if="collapseTags && currentLabels.length">
                    <el-tag :closable="!cascaderDisabled"
                        :size="collapseTagSize"
                        type="info"
                        @close="deleteTag($event, 0)"
                        disable-transitions>
                        <span class="el-select__tags-text"
                            v-if="showAllLevels">{{ currentLabels[0].join(separator) }}</span>
                            <span class="el-select__tags-text"
                                v-else>{{ currentLabels[0][currentLabels[0].length - 1] }}</span>
                    </el-tag>
                    <el-tag v-if="currentLabels.length > 1"
                        :closable="false"
                        :size="collapseTagSize"
                        type="info"
                        disable-transitions>
                        <span class="el-select__tags-text">+ {{ currentLabels.length - 1 }}</span>
                    </el-tag>
                </span>
                <transition-group @after-leave="resetInputHeight"
                    v-if="!collapseTags">
                    <el-tag class="el-select__input"
                        v-for="(item, index) in currentLabels"
                        :key="item.toString()"
                        :closable="!cascaderDisabled"
                        :size="collapseTagSize"
                        type="info"
                        @close="deleteTag($event, index)"
                        disable-transitions>
                        <span class="el-select__tags-text"
                            v-if="showAllLevels">{{ item.join(separator) }}</span>
                            <span class="el-select__tags-text"
                                v-else>{{ item[item.length - 1] }}</span>
                    </el-tag>
                </transition-group>
                <el-input ref="multiInput"
                    class="el-multicascader__input "
                    :readonly="readonly"
                    :placeholder="currentLabels.length ? undefined : placeholder"
                    v-model="inputValue"
                    @input="debouncedInputChange"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    @compositionstart.native="handleComposition"
                    @compositionend.native="handleComposition"
                    :validate-event="false"
                    :size="collapseTagSize"
                    v-if="filterable && currentLabels.length"
                    :disabled="cascaderDisabled"
                    :class="{ 'is-focus': menuVisible }"
                    :style="{ 'flex-grow': '1', width: inputLength / (inputWidth - 32) + '%', 'max-width': inputWidth - 42 + 'px' }">
                </el-input>
            </template>
            <template v-else>
                <template v-if="showAllLevels">
                    <template v-for="(label, index) in currentLabels">
                        {{ label }}
                        <span v-if="index < currentLabels.length - 1"
                            :key="index"> {{ separator }} </span>
                    </template>
                </template>
                <template v-else>
                    {{ currentLabels[currentLabels.length - 1] }}
        </template>
                </template>
        </span>
    </span>
</template>

<script>
import Vue from 'vue';
import ElMultiCascaderMenu from './menu';
import ElInput from 'element-ui/packages/input';
import ElTag from 'element-ui/packages/tag';
import Popper from 'element-ui/src/utils/vue-popper';
import Clickoutside from 'element-ui/src/utils/clickoutside';
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
import emitter from 'element-ui/src/mixins/emitter';
import Locale from 'element-ui/src/mixins/locale';
import { t } from 'element-ui/src/locale';
import debounce from 'throttle-debounce/debounce';
import { generateId, escapeRegexpString, isIE, isEdge } from 'element-ui/src/utils/util';

const popperMixin = {
    props: {
        placement: {
            type: String,
            default: 'bottom-start'
        },
        appendToBody: Popper.props.appendToBody,
        parentEl: {
            type: String
        },
        arrowOffset: Popper.props.arrowOffset,
        offset: Popper.props.offset,
        boundariesPadding: Popper.props.boundariesPadding,
        popperOptions: Popper.props.popperOptions
    },
    methods: Popper.methods,
    data: Popper.data,
    beforeDestroy: Popper.beforeDestroy
};

const copyArray = (arr, currentPath, valueKey, childrenKey) => {
    if (!arr || !Array.isArray(arr)) return arr;
    const result = [];

    arr.forEach((item = {}) => {
        if (typeof item === 'object' && !Array.isArray(item)) {
            let itemCopy = {};
            let configurableProps = Object.keys(item);
            configurableProps.forEach(prop => {
                if (Array.isArray(item[prop])) {
                    if (prop === childrenKey && currentPath) {
                        itemCopy[prop] = copyArray(item[prop], [...currentPath, item[valueKey]], valueKey, childrenKey);
                    } else {
                        itemCopy[prop] = copyArray(item[prop]);
                    }
                } else {
                    itemCopy[prop] = item[prop];
                }
            });
            if (currentPath) {
                itemCopy.path = [...currentPath, item[valueKey]];
            }
            result.push(itemCopy);
        } else {
            result.push(JSON.parse(JSON.stringify(item)));
        }
    });
    return result;
};

export default {
    name: 'ElMultiCascader',

    directives: { Clickoutside },

    mixins: [popperMixin, emitter, Locale],

    inject: {
        elForm: {
            default: ''
        },
        elFormItem: {
            default: ''
        }
    },

    components: {
        ElInput,
        ElTag
    },

    props: {
        options: {
            type: Array,
            required: true
        },
        props: {
            type: Object,
            default () {
                return {
                    children: 'children',
                    label: 'label',
                    value: 'value',
                    disabled: 'disabled'
                };
            }
        },
        value: {
            type: Array,
            default () {
                return [];
            }
        },
        currentActiveValue: {
            type: Array,
            default () {
                return [];
            }
        },
        separator: {
            type: String,
            default: '/'
        },
        placeholder: {
            type: String,
            default () {
                return t('el.cascader.placeholder');
            }
        },
        disabled: Boolean,
        clearable: {
            type: Boolean,
            default: false
        },
        changeOnSelect: Boolean,
        collapseTags: Boolean,
        popperClass: String,
        expandTrigger: {
            type: String,
            default: 'click'
        },
        filterable: Boolean,
        size: String,
        showAllLevels: {
            type: Boolean,
            default: true
        },
        debounce: {
            type: Number,
            default: 300
        },
        beforeFilter: {
            type: Function,
            default: () => (() => {})
        },
        hoverThreshold: {
            type: Number,
            default: 500
        },
        multiple: {
            type: Boolean,
            default: false
        },
        selectChildren: {
            type: Boolean,
            default: false
        },
        onlyOutPutLeafNode: { // 是否只输出叶子节点的值
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            currentValue: this.value || [],
            menu: null,
            debouncedInputChange() {},
            menuVisible: false,
            inputHover: false,
            inputValue: '',
            flatOptions: null,
            id: generateId(),
            needFocus: true,
            isOnComposition: false,
            inputLength: 20,
            inputWidth: 0,
            initialInputHeight: 0
        };
    },

    computed: {
        labelKey() {
            return this.props.label || 'label';
        },
        valueKey() {
            return this.props.value || 'value';
        },
        childrenKey() {
            return this.props.children || 'children';
        },
        disabledKey() {
            return this.props.disabled || 'disabled';
        },
        currentLabels() {
            let labels = [];
            if (this.multiple) {
                this.currentValue.forEach(values => {
                    let singleLabel = [];
                    let options = this.options;
                    values.forEach(value => {
                        const targetOption = options && options.filter(option => option[this.valueKey] === value)[0];
                        if (targetOption) {
                            singleLabel.push(targetOption[this.labelKey]);
                            options = targetOption[this.childrenKey];
                        }
                    });
                    labels.push(singleLabel);
                });
                return labels;
            }
            let options = this.options;
            this.currentValue.forEach(value => {
                const targetOption = options && options.filter(option => option[this.valueKey] === value)[0];
                if (targetOption) {
                    labels.push(targetOption[this.labelKey]);
                    options = targetOption[this.childrenKey];
                }
            });
            return labels;
        },
        _elFormItemSize() {
            return (this.elFormItem || {}).elFormItemSize;
        },
        cascaderSize() {
            return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
        },
        cascaderDisabled() {
            return this.disabled || (this.elForm || {}).disabled;
        },
        collapseTagSize() {
            return ['small', 'mini'].indexOf(this.cascaderSize) > -1 ?
                'mini' :
                'small';
        },
        readonly() {
            return !this.filterable || (!isIE() && !isEdge() && !this.menuVisible);
        }
    },

    watch: {
        menuVisible(value) {
            this.$refs.input.$refs.input.setAttribute('aria-expanded', value);
            value ? this.showMenu() : this.hideMenu();
            if (value) {
                this.inputLength = 20;
            }
            this.$emit('visible-change', value);
        },
        value(value) {
            this.currentValue = value;
            if (this.filterable && !this.multiple) {
                this.inputLength = 20;
            }
            if (this.multiple) {
                this.resetInputHeight();
            }
        },
        currentValue(value) {
            if (this.multiple) {
                this.resetInputHeight();
            }
            this.dispatch('ElFormItem', 'el.form.change', [value]);
        },
        currentLabels(value) {
            const inputLabel = this.showAllLevels ? value.join('/') : value[value.length - 1];
            this.$refs.input.$refs.input.setAttribute('value', inputLabel);
        },
        options: {
            deep: true,
            handler(value) {
                if (!this.menu) {
                    this.initMenu();
                }
                if (this.multiple) {
                    this.resetInputHeight();
                }
                this.flatOptions = this.flattenOptions(this.options);
                this.$forceUpdate();
            }
        }
    },

    methods: {
        initMenu() {
            this.menu = new Vue(ElMultiCascaderMenu).$mount();
            this.menu.options = this.options;
            this.menu.props = this.props;
            this.menu.multiple = this.multiple;
            this.menu.selectChildren = this.selectChildren;
            this.menu.expandTrigger = this.expandTrigger;
            this.menu.changeOnSelect = this.changeOnSelect;
            this.menu.onlyOutPutLeafNode = this.onlyOutPutLeafNode;
            this.menu.popperClass = this.popperClass;
            this.menu.hoverThreshold = this.hoverThreshold;
            this.menu.currentActiveValue = this.currentActiveValue;
            this.popperElm = this.menu.$el;
            if (!this.appendToBody && document.querySelector(this.parentEl)) {
                document.querySelector(this.parentEl).appendChild(this.popperElm);
            }
            this.menu.$refs.menus[0].setAttribute('id', `cascader-menu-${this.id}`);
            this.menu.$on('pick', this.handlePick);
            this.menu.$on('activeItemChange', this.handleActiveItemChange);
            this.menu.$on('menuLeave', this.doDestroy);
            this.menu.$on('closeInside', this.handleClickoutside);
        },
        showMenu() {
            if (!this.menu) {
                this.initMenu();
            }
            this.menu.value = this.currentValue.slice(0);
            this.menu.visible = true;
            this.menu.options = this.options;
            this.$nextTick(_ => {
                this.updatePopper();
                this.menu.inputWidth = this.$refs.input.$el.offsetWidth - 2;
            });
        },
        hideMenu() {
            this.inputValue = '';
            this.menu.visible = false;
            if (this.needFocus) {
                if (this.multiple && this.filterable && this.currentLabels.length) {
                    this.$refs.multiInput.focus();
                } else {
                    this.$refs.input.focus();
                }
            } else {
                this.needFocus = true;
            }
        },
        handleActiveItemChange(value) {
            this.$nextTick(_ => {
                this.updatePopper();
            });
            this.$emit('active-item-change', value);
        },
        handleKeydown(e) {
            const keyCode = e.keyCode;
            if (keyCode === 13) {
                this.handleClick();
            } else if (keyCode === 40) { // down
                this.menuVisible = true; // 打开
                setTimeout(() => {
                    const firstMenu = this.popperElm.querySelectorAll('.el-cascader-menu')[0];
                    firstMenu.querySelectorAll("[tabindex='-1']")[0].focus();
                });
                e.stopPropagation();
                e.preventDefault();
            } else if (keyCode === 27 || keyCode === 9) { // esc  tab
                this.inputValue = '';
                if (this.menu) this.menu.visible = false;
            }
        },
        handlePick(value, close = true, forceClose) {
            this.currentValue = value;
            this.$emit('input', value);
            this.$emit('change', value);

            if ((close && !this.multiple) || forceClose) {
                this.menuVisible = false;
            } else {
                this.$nextTick(this.updatePopper);
            }
        },
        handleInputChange(value) {
            if (!this.menuVisible) return;
            if (this.multiple && this.filterable) {
                const length = this.$refs.input.value.length * 15 + 20;
                this.inputLength = this.collapseTags ? Math.min(50, length) : length;
                this.resetInputHeight();
            }
            const flatOptions = this.flatOptions;

            if (!value) {
                this.menu.options = this.options;
                this.$nextTick(this.updatePopper);
                return;
            }

            let filteredFlatOptions = flatOptions.filter(optionsStack => {
                return optionsStack.some(option => new RegExp(escapeRegexpString(value), 'i')
                    .test(option[this.labelKey]));
            });

            if (filteredFlatOptions.length > 0) {
                filteredFlatOptions = filteredFlatOptions.map(optionStack => {
                    return {
                        __IS__FLAT__OPTIONS: true,
                        parent: optionStack[optionStack.length - 1].parent,
                        value: optionStack.map(item => item[this.valueKey]),
                        path: optionStack.map(item => item[this.valueKey]),
                        isLeafNode: optionStack[optionStack.length - 1].isLeafNode,
                        label: this.renderFilteredOptionLabel(value, optionStack),
                        disabled: optionStack.some(item => item[this.disabledKey])
                    };
                });
            } else {
                filteredFlatOptions = [{
                    __IS__FLAT__OPTIONS: true,
                    label: this.t('el.cascader.noMatch'),
                    value: '',
                    disabled: true
                }];
            }
            this.menu.options = filteredFlatOptions;
            this.$nextTick(this.updatePopper);
        },
        renderFilteredOptionLabel(inputValue, optionsStack) {
            return optionsStack.map((option, index) => {
                const label = option[this.labelKey];
                const keywordIndex = label.toLowerCase().indexOf(inputValue.toLowerCase());
                const labelPart = label.slice(keywordIndex, inputValue.length + keywordIndex);
                const node = keywordIndex > -1 ? this.highlightKeyword(label, labelPart) : label;
                return index === 0 ? node : [` ${this.separator} `, node];
            });
        },
        highlightKeyword(label, keyword) {
            const h = this._c;
            return label.split(keyword)
                .map((node, index) => index === 0 ? node : [
                    h('span', { class: { 'el-cascader-menu__item__keyword': true } }, [this._v(keyword)]),
                    node
                ]);
        },
        flattenOptions(options, ancestor = []) {
            let flatOptions = [];
            if (options.length > 0 && options[0].path) {
                options = copyArray(options);
            } else {
                options = copyArray(options, [], this.valueKey, this.childrenKey);
            }
            options.forEach((option) => {
                option.path = ancestor.map(ele => ele[this.valueKey]);
                option.path.push(option[this.valueKey]);
                option.isLeafNode = !(Array.isArray(option[this.childrenKey]) && option[this.childrenKey].length > 0);
                option.parent = ancestor[ancestor.length - 1]; // 子节点肯定会被搜出来，父节点不一定
                const optionsStack = ancestor.concat(option);
                if (!option[this.childrenKey]) {
                    flatOptions.push(optionsStack);
                } else {
                    if (this.changeOnSelect) {
                        flatOptions.push(optionsStack);
                    }
                    flatOptions = flatOptions.concat(this.flattenOptions(option[this.childrenKey], optionsStack));
                }
            });
            return flatOptions;
        },
        clearValue(ev) {
            ev.stopPropagation();
            this.handlePick([], true, true);
        },
        handleClickoutside(pickFinished = false) {
            if (this.menuVisible && !pickFinished) {
                this.needFocus = false;
            }
            this.menuVisible = false;
        },
        handleClick() {
            if (this.cascaderDisabled) return;
            if (this.multiple && this.filterable && this.currentLabels.length) {
                this.$refs.multiInput.focus();
            } else {
                this.$refs.input.focus();
            }
            if (this.filterable) {
                this.menuVisible = true;
                return;
            }
            this.menuVisible = !this.menuVisible;
        },
        handleFocus(event) {
            this.$emit('focus', event);
        },
        handleBlur(event) {
            this.$emit('blur', event);
        },
        handleComposition(event) {
            this.isOnComposition = event.type !== 'compositionend';
        },
        resetInputHeight() {
            if (this.collapseTags && !this.filterable) return;
            this.$nextTick(() => {
                if (!this.$refs.input) return;
                let inputChildNodes = this.$refs.input.$el.childNodes;
                let input = [].filter.call(inputChildNodes, item => item.tagName === 'INPUT')[0];
                const tags = this.$refs.tags;
                const sizeInMap = this.initialInputHeight || 40;
                input.style.height = this.currentValue.length === 0 ?
                    sizeInMap + 'px' :
                    Math.max(
                        tags ? (tags.clientHeight + (tags.clientHeight > sizeInMap ? 6 : 0)) : 0, sizeInMap
                    ) + 'px';
                if (this.visible && this.emptyText !== false) {
                    this.updatePopper();
                }
            });
        },
        resetInputWidth() {
            this.inputWidth = this.$refs.input.$el.getBoundingClientRect().width;
        },
        handleResize() {
            this.resetInputWidth();
            if (this.multiple) this.resetInputHeight();
        },
        deleteTag(event, index) {
            if(!this.menu) {
                this.initMenu();
            }
            if (index > -1 && !this.cascaderDisabled) {
                let value = this.currentValue.slice();
                let item = this.currentValue[index];
                if (this.selectChildren) { // 子节点如果随着父节点联动，则子节点取消也会取消父节点的选中状态, 并取消孙子节点的状态
                    // 删除父节点
                    item.forEach((ele, idx) => {
                        let currentPath = item.slice(0, idx + 1);
                        let currentIndex = value.findIndex((ele) => this.menu.isArrayEqual(currentPath, ele));
                        if (currentIndex !== -1) {
                            value.splice(currentIndex, 1);
                        }
                    });
                    // 删除子节点
                    value = value.filter((ele) => !(ele.length > item.length && this.menu.isArrayEqual(item, ele.slice(0, item.length))));
                } else {
                    let currentIndex = value.findIndex((ele) => this.menu.isArrayEqual(item, ele));
                    if (currentIndex !== -1) {
                        value.splice(currentIndex, 1);
                    }
                }
                this.handlePick(value, true, true);
            }
            event.stopPropagation();
        }
    },

    created() {
        this.debouncedInputChange = debounce(this.debounce, value => {
            const before = this.beforeFilter(value);

            if (before && before.then) {
                this.menu.options = [{
                    __IS__FLAT__OPTIONS: true,
                    label: this.t('el.cascader.loading'),
                    value: '',
                    disabled: true
                }];
                before
                    .then(() => {
                        this.$nextTick(() => {
                            this.handleInputChange(value);
                        });
                    });
            } else if (before !== false) {
                this.$nextTick(() => {
                    this.handleInputChange(value);
                });
            }
        });
    },

    mounted() {
        this.flatOptions = this.flattenOptions(this.options);
        addResizeListener(this.$el, this.handleResize);
        const input = this.$refs.input;
        this.$nextTick(() => {
            if (input && input.$el) {
                const sizeMap = {
                    medium: 36,
                    small: 32,
                    mini: 28
                };
                this.inputWidth = input.$el.getBoundingClientRect().width;
                this.initialInputHeight = input.$el.getBoundingClientRect().height || sizeMap[this.size];
            }
        });
    },
    beforeDestroy() {
        if (this.$el && this.handleResize) removeResizeListener(this.$el, this.handleResize);
    }
};
</script>

<style lang="less">

.multi-cascader {
    .multi-base-input {
        input {
            color: transparent;
        }
    }
}
.el-multicascader__input {
    .el-input__inner {
        color: transparent
    }

    width: auto;

    >input {
        border: none;
        padding: 0;
        width: calc(100% - 4px);
        margin: 2px 0 2px 6px;
        display: inline-block;
        color: #606266;
    }
}

.el-multicascader__label {
    height: auto;
    position: absolute;
    line-height: normal;
    white-space: normal;
    z-index: 1;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: 0;
    background: transparent;
    margin-left: 1px;

    >span {
        display: contents;
    }
}



.el-tag__close {
    margin-top: -2px;
}

.el-tag {
    box-sizing: border-box;
    border-color: transparent;
    margin: 2px 0 2px 6px;
    background-color: #f0f2f5;

    &__close.el-icon-close {
        background-color: #c0c4cc;
        right: -7px;
        top: 0;
        color: #fff;

        &:hover {
            background-color: #909399;
        }

        &::before {
            display: block;
            transform: translate(0, .5px);
        }
    }
}
</style>