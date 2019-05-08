<template>
    <div class="example-wrap">
        <json-viewer :value="optionsShow"
            :expand-depth=5
            copyable
            boxed
            sort
            theme="json-theme"></json-viewer>
        <div class="block">
            <!-- <el-multi-cascader class="multi-cascader" :options="options" multiple filterable select-children clearable collapse-tags
            only-out-put-leaf-node
            change-on-select v-model="selectedOptions"> </el-multi-cascader> -->
            <div class="top-setting">
                <p>
                    如果选父节点子节点不联动（selectChildren：false），且只输出子节点（onlyOutPutLeafNode：true），选父节点没有任何效果等同于changeOnSelect为false
                </p>
                <el-checkbox v-model="selectChildren"
                    label="selectChildren--是否父子联动(仅多选有效, 默认false)"
                    @change="handleChange"></el-checkbox>
                <el-checkbox v-model="onlyOutPutLeafNode"
                    label="onlyOutPutLeafNode--只输出叶子节点(仅多选有效, 默认false)"
                    @change="handleChange"></el-checkbox>
                <el-checkbox v-model="collapseTags"
                    label="collapseTags--是否折叠label(仅多选有效, 默认false)"
                    @change="handleChange"></el-checkbox>
                <el-checkbox v-model="filterable"
                    label="filterable--是否可搜索"
                    @change="handleChange"></el-checkbox>
                <el-checkbox v-model="showAllLevels"
                    label="showAllLevels--是否展示全部label"
                    @change="handleChange"></el-checkbox>
                <el-checkbox v-model="disabled"
                    label="disabled--是否禁用"
                    @change="handleChange"></el-checkbox>
                <el-checkbox v-model="changeOnSelect"
                    label="changeOnSelect--是否可以选任意一级"
                    @change="handleChange"></el-checkbox>
                <el-checkbox v-model="appendToBody"
                    label="appendToBody--是否挂载到body上，选否需用parent-el属性提供挂载元素选择器"
                    @change="handleChange"></el-checkbox>


                <el-radio-group v-model="expandTrigger"
                    @change="handleChange">
                    <el-radio label="click">click触发菜单</el-radio>
                    <el-radio label="hover">hover触发菜单</el-radio>
                </el-radio-group>
                <el-checkbox v-model="currentActiveValue"
                    label="currentActiveValue--多选模式是否以指定路径打开菜单，demo设置为[1, 11, 51]"
                    @change="handleChange"></el-checkbox>
                <el-input v-model="separator"
                    placeholder="分隔符"
                    label="分隔符"
                    @change="handleChange">
                    <template slot="prepend">分隔符</template>
                </el-input>
            </div>
            <el-multi-cascader class="multi-cascader"
                :options="options"
                v-if="shouldReset"
                multiple
                :currentActiveValue="currentActiveValue ? [1, 11, 51] : []"
                :select-children="selectChildren"
                :only-out-put-leaf-node="onlyOutPutLeafNode"
                :collapse-tags="collapseTags"
                :filterable="filterable"
                :show-all-levels="showAllLevels"
                :expand-trigger="expandTrigger"
                :separator="separator"
                :disabled="disabled"
                @change="valueChange"
                :clearable="clearable"
                :change-on-select="changeOnSelect"
                :append-to-body="appendToBody"
                @active-item-change="handleItemChange"
                size="medium"
                parent-el=".multi-cascader"
                v-model="selectedOptions">
            </el-multi-cascader>
            <div class="select-value">
                <span v-for="item in selectedOptions"
                    :key="Array.isArray(item) ? item.join(',') : item">{{item}}</span>
            </div>
            <el-multi-cascader class="multi-cascader"
                v-if="shouldReset"
                :options="options2"
                :filterable="filterable"
                :show-all-levels="showAllLevels"
                :expand-trigger="expandTrigger"
                :separator="separator"
                :disabled="disabled"
                :clearable="clearable"
                :change-on-select="changeOnSelect"
                v-model="selectedOptions2">
            </el-multi-cascader>
            <div class="select-value">
                <span v-for="item in selectedOptions2"
                    :key="Array.isArray(item) ? item.join(',') : item">{{item}}</span>
            </div>
        </div>


        <!-- <json-viewer :value="selectedOptions" :expand-depth=5 copyable boxed sort></json-viewer> -->
    </div>
</template>


<script>
export default {
    data() {
        const optionsShow = [{
            label: "默认",
            id: -1,
            children: [],
            value: -1
        },
        {
            label: "电信",
            children: [{
                label: "华东电信",
                children: [{
                    label: "安徽电信",
                    id: 51,
                    children: null,
                    value: 51
                },
                {
                    label: "福建电信",
                    id: 52,
                    children: null,
                    value: 52
                },
                {
                    label: "江苏电信",
                    id: 53,
                    children: null,
                    value: 53
                }],
                id: 11,
                value: 11
            },
            {
                label: "华南电信",
                children: [{
                    label: "广东电信",
                    id: 58,
                    children: null,
                    value: 58
                },
                {
                    label: "广西电信",
                    id: 59,
                    children: null,
                    value: 59
                }],
                id: 12,
                value: 12
            }],
            id: 1,
            value: 1
        },
        {
            label: "联通",
            children: [{
                label: "华东联通",
                children: [{
                    label: "安徽联通",
                    id: 91,
                    children: null,
                    value: 91
                },
                {
                    label: "福建联通",
                    id: 92,
                    children: null,
                    value: 92
                },
                {
                    label: "江苏联通",
                    id: 93,
                    children: null,
                    value: 93
                }],
                id: 21,
                value: 21,
                disabled: true
            },
            {
                label: "华南联通",
                children: [{
                    label: "广东联通",
                    id: 98,
                    children: null,
                    value: 98
                },
                {
                    label: "广西联通",
                    id: 99,
                    children: null,
                    value: 99
                },
                {
                    label: "海南联通",
                    id: 100,
                    children: null,
                    value: 100
                }],
                id: 22,
                value: 22,
                disabled: true
            }],
            id: 2,
            value: 2,
            disabled: true
        },
        {
            label: "移动",
            children: [{
                label: "华东移动",
                children: [{
                    label: "安徽移动",
                    id: 131,
                    children: null,
                    value: 131
                }],
                id: 31,
                value: 31,
                disabled: true
            },
            {
                label: "华南移动",
                children: [{
                    label: "广东移动",
                    id: 138,
                    children: null,
                    value: 138
                },
                {
                    label: "广西移动",
                    id: 139,
                    children: null,
                    value: 139
                },
                {
                    label: "海南移动",
                    id: 140,
                    children: null,
                    value: 140
                }],
                id: 32,
                value: 32,
                disabled: true
            }],
            id: 3,
            value: 3,
            disabled: true
        },
        {
            label: "教育网",
            id: 6,
            children: null,
            value: 6
        },
        {
            label: "电信通",
            id: 7,
            children: null,
            value: 7
        }];
        return {
            shouldReset: true,
            selectedOptions: [],
            selectedOptions2: [],
            optionsShow: JSON.parse(JSON.stringify(optionsShow)),
            options2: JSON.parse(JSON.stringify(optionsShow)),
            options: JSON.parse(JSON.stringify(optionsShow)),
            appendToBody: true,
            multiple: true,
            selectChildren: true,
            onlyOutPutLeafNode: false,
            collapseTags: false,
            filterable: true,
            showAllLevels: true,
            expandTrigger: 'hover',
            separator: '-',
            disabled: false,
            clearable: true,
            changeOnSelect: true,
            currentActiveValue: false
        }
    },
    methods: {
        valueChange($event) {
            console.log($event);
        },
        handleChange() {
            this.selectedOptions = [];
            this.options = JSON.parse(JSON.stringify(this.optionsShow));
            this.shouldReset = false;
            this.$nextTick(() => {
                this.shouldReset = true;
            });
        },
        handleItemChange($event) {
            if ($event[0] === -1) {
                setTimeout(() => {
                    this.options[0].children = [{
                        label: "异步加载的二级",
                        children: [{
                            label: "安徽电信",
                            id: 51,
                            children: null,
                            value: 51
                        },
                        {
                            label: "福建电信",
                            id: 52,
                            children: null,
                            value: 52
                        },
                        {
                            label: "江苏电信",
                            id: 53,
                            children: null,
                            value: 53
                        }],
                        id: 11,
                        value: 11
                    }]
                }, 1000);

            }
        }
    },
};
</script>
<style lang="less">
.top-setting {

    .el-checkbox,
    .el-input,
    .el-radio-group {
        max-width: 550px;
        min-width: 450px;
        margin: 5px 0;
    }
}

.example-wrap {
    height: 100%;
    position: fixed;
}

.block {
    display: inline-block;
    vertical-align: top;
    margin: 20px 5px;
    width: calc(100vw - 540px);

    .multi-cascader {
        margin-bottom: 10px;
        width: 300px;
    }
}

.select-value {
    display: inline-block;
    vertical-align: top;
    margin-bottom: 10px;
    width: calc(100vw - 850px);
    min-height: 300px;
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 10px;
    box-sizing: border-box;

    >span {
        display: block;
    }
}
</style>
<style lang="scss">
.jv-container {
    width: 500px;
    height: calc(100% - 40px);
    display: inline-block;
    margin: 20px 0;
}

.json-theme {
    background: #fff;
    white-space: nowrap;
    color: #525252;
    font-size: 14px;
    font-family: Consolas, Menlo, Courier, monospace;

    .jv-ellipsis {
        color: #999;
        background-color: #eee;
        display: inline-block;
        line-height: 0.9;
        font-size: 0.9em;
        padding: 0px 4px 2px 4px;
        border-radius: 3px;
        vertical-align: 2px;
        cursor: pointer;
        user-select: none;
    }

    .jv-button {
        color: #49b3ff
    }

    .jv-key {
        color: #111111
    }

    .jv-item {
        &.jv-array {
            color: #111111
        }

        &.jv-boolean {
            color: #fc1e70
        }

        &.jv-function {
            color: #067bca
        }

        &.jv-number {
            color: #fc1e70
        }

        &.jv-object {
            color: #111111
        }

        &.jv-undefined {
            color: #e08331
        }

        &.jv-string {
            color: #42b983;
            word-break: break-word;
            white-space: normal;
        }
    }

    .jv-code {
        overflow: scroll !important;
        max-height: unset !important;
        height: calc(100% - 40px);

        .jv-toggle {
            &:before {
                padding: 0px 2px;
                border-radius: 2px;
            }

            &:hover {
                &:before {
                    background: #eee;
                }
            }
        }
    }
}
</style>