<template>
    <div>
    <span>refSugar </span>    
    <button @click="inc">{{ count }}</button>

    </div>
</template>

<script setup>
import {watch} from 'vue'
// declaring a variable that compiles to a ref
ref: count = 1

function inc() {
  // the variable can be used like a plain value
  count++
}

// access the raw ref object by prefixing with $
console.log($count.value)

watch($count,()=>{
    console.log(count);
})
</script>

<style scoped>

</style>