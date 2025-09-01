<template>
  <div>
    <div>
      <div :class="style.headerViewPanel">
        <p :class="style.toggleText" @click="openUserViewPanel()" v-if="userStore.isLoggedIn && userStore.isAdmin">
          <Users :size="18" /> {{ isOpenUserViewPanel ? 'Hide User View Panel' : 'Show User View Panel' }}
        </p>
        <p :class="style.toggleText" @click="openNoteUpdatePanel()" v-if="userStore.isLoggedIn && userStore.isAdmin">
          <FileText :size="18" />  {{ isOpenNoteUpdate ? 'Hide Update Note Panel' : 'Show Update Note Panel' }}
        </p>
        <p :class="style.toggleText" @click="openQuestionReviewPanel()" v-if="userStore.isLoggedIn && userStore.isAdmin">
          <MessagesSquare :size="18" />  {{ isOpenQuestionReview ? 'Close Held Question Review Panel' : 'Open Held Question review Panel'}}
        </p>
      </div>
      <div :class="style.contentPanelContainer">
        <transition name="fade">
          <div v-if="isOpenNoteUpdate && userStore.isLoggedIn && userStore.isAdmin" :class="style.contentBox">
            <div v-if="!isLoadingNotes">
              <div v-if="newTopics.length">
                <ol>
                  <li v-for="(topic, index) in newTopics" :key="index" :class="style.topicItem">
                    <div>
                      <strong>Topic:</strong> {{ topic.topic }}<br>
                      <strong>Class:</strong> {{ topic.class }}<br>
                      <strong>Subject:</strong> {{ topic.sub }}<br><br>
                    </div>
                    <button @click="updateDB(topic.topic)" :class="style.btns">Add {{ topic.topic }} </button>
                  </li>
                </ol>
              </div>
              <div v-else> No New Topics Found</div>
            </div>
            <div v-else :class="style.loadingContainer"><span :class="style.spinner"></span>Loading, Please Wait</div>
            <div v-if="!isLoadingNotes" :class="style.tags">
              <button @click="updateDB('')" :class="style.btns">Add All Listed</button>
            </div>
          </div>
        </transition>
        <transition name="fade">
          <div v-if="isOpenQuestionReview && userStore.isLoggedIn && userStore.isAdmin" :class="style.contentBox">
            <div v-if="!isLoadingHeldQuestions">
              <ul v-if="heldQuestions.length">
                <li v-for="question in heldQuestions" :key="question._id">
                  <strong>Question ID:</strong> {{ question._id }}<br>
                  <strong>Title:</strong> {{ question.title }}<br>
                  <strong>Body:</strong> {{ question.body }}<br>
                  <strong>Tags:</strong> {{ question.tags.join(', ') }}<br>
                  <strong>User:</strong> {{ question.user }}<br>
                  <strong>Created At:</strong> {{ new Date(question.CreatedAt).toLocaleString() }}<br>
                  <strong>Harm Score:</strong> {{ question.harmScore }}<br>
                  <strong>Flagged Attributes:</strong>
                  <ul>
                    <li v-for="attr in question.flaggedAttributes" :key="attr.attribute">
                      {{ attr.attribute }} — Avg: {{ attr.avg }}
                    </li>
                  </ul>
                  <div :class="style.tags">
                    <button @click="approveQuestion(question._id, true)" :class="style.btns">Approve Question</button>
                    <button @click="approveQuestion(question._id, false)" :class="style.btns">Reject Question</button>
                  </div>
                </li>
              </ul>
              <p v-else>No held questions found.</p>
            </div>
            <div v-else :class="style.loadingContainer"><span :class="style.spinner"></span>Loading, Please Wait</div>
          </div>
        </transition>
        <transition name="fade">
           <div class="p-4" v-if="isOpenUserViewPanel&& userStore.isLoggedIn && userStore.isAdmin">
            <div v-if="!isLoadingUsers">
              <table :class="style.userTable">
                <thead>
                  <tr :class="style.tableHeaderRow">
                    <th :class="style.tableCell">Database ID</th>
                    <th :class="style.tableCell">Name</th>
                    <th :class="style.tableCell">Username</th>
                    <th :class="style.tableCell">Reg. Date</th>
                    <th :class="style.tableCell">FH ID</th>
                    <th :class="style.tableCell">Email</th>
                    <th :class="style.tableCell">Class</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(user, index) in users" :key="index">
                    <td :class="style.tableCell">{{ user._id }}</td>
                    <td :class="style.tableCell">{{ user.name }}</td>
                    <td :class="style.tableCell">{{ user.username }}</td>
                    <td :class="style.tableCell">{{ new Date(user.registrationDate).toLocaleString() || 'N/A' }}</td>
                    <td :class="style.tableCell">{{ user.FHiD || 'N/A' }}</td>
                    <td :class="style.tableCell">{{ user.email || 'N/A'}}</td>
                    <td :class="style.tableCell">{{ user.Class || 'N/A' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else :class="style.loadingContainer"><span :class="style.spinner"></span>Loading, Please Wait</div>
          </div>
        </transition>   
      </div>
    </div>
  </div>
</template>


<script setup>
  import { ref, onMounted } from 'vue'
  import { useUserStore } from '/stores/user.js'
  import style from './dashboard.module.css'
  import { Users, FileText, MessagesSquare } from 'lucide-vue-next'

  const userStore = useUserStore()
  const isOpenNoteUpdate = ref(false)
  const isOpenQuestionReview = ref(false)
  const isOpenUserViewPanel = ref(false)
  const isLoadingNotes = ref(false)
  const isLoadingHeldQuestions = ref(false)
  const isLoadingUsers = ref(false)
  const newTopics = ref([])
  const heldQuestions = ref([])
  const users = ref([])

  onMounted(async () => {
    userStore.fetchUser();
    if (!userStore.isLoggedIn) {
      // Wait until fetchUser has been called at least once
        window.location.href = '/login'
    }
  })

  function openNoteUpdatePanel(){
    isOpenQuestionReview.value = false
    isOpenUserViewPanel.value = false
    GetNewFileList()
    setTimeout( ()=> {isOpenNoteUpdate.value = !isOpenNoteUpdate.value;}, 350) 
  }

  function openQuestionReviewPanel(){
    isOpenNoteUpdate.value = false
    isOpenUserViewPanel.value = false
    getHeldQuestion()
    setTimeout( ()=> {isOpenQuestionReview.value = !isOpenQuestionReview.value;}, 350) 
  }

  function openUserViewPanel(){
    isOpenNoteUpdate.value = false
    isOpenQuestionReview.value = false
    getUsersList()
    setTimeout( ()=> {isOpenUserViewPanel.value = !isOpenUserViewPanel.value;}, 350) 
  }

  async function updateDB(reqFile) {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notes/update?file=${encodeURIComponent(reqFile)}`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        newTopics.value = data.newTopics || []
      } else {
        console.error('Failed to update notes:', data.message)
      }
      openNoteUpdatePanel()
      openNoteUpdatePanel()
    } catch (error) {
      console.error('Failed to update notes:', error)
    }
  }

  async function GetNewFileList() {
    isLoadingNotes.value = true
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notes/update/listNewFiles`, {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success && Array.isArray(data.newTopics)) {
        newTopics.value = data.newTopics
      } else {
        newTopics.value = []
      }

    } catch (error) {
      console.error('Failed to fetch new topics:', error)
    } finally {
      isLoadingNotes.value = false
    }
  }


  async function getHeldQuestion() {
    isLoadingHeldQuestions.value = true
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/forum/questions/held`, {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()
      if (data.success && Array.isArray(data.heldQuestions)) {
        heldQuestions.value = data.heldQuestions
      } else {
        heldQuestions.value = []
      }

      console.log('Held Questions:', heldQuestions.value)
    } catch (error) {
      console.error('Failed to fetch held questions:', error)
    } finally {
      isLoadingHeldQuestions.value = false
    }
  }

  async function getUsersList(){
    isLoadingUsers.value = true
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/allUserList`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()
      if (data.success && Array.isArray(data.users)) {
        users.value = data.users
      } else {
        users.value = []
      }

    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      isLoadingUsers.value = false
    }
  }

  async function approveQuestion(questionId, isApproved) {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/forum/questions/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ questionId, isApproved })
      })

      const data = await response.json()
      if (data.success) {
        window.alert(data.message)
        heldQuestions.value = heldQuestions.value.filter(q => q._id !== questionId)
      } else {
        console.error('Failed to approve/reject question:', data.message)
      }
    } catch (error) {
      console.error('Error approving/rejecting question:', error)
    }
    
  }


</script>

<style>
  /* Global transition (not CSS module) */
  .fade-enter-active, .fade-leave-active {
    transition: all 0.3s ease;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
    transform: translateY(-5px);
  }
</style>