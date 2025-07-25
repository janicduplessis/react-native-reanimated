#pragma once

#include <jsi/jsi.h>
#include <react/debug/react_native_assert.h>

#include <mutex>
#include <set>

using namespace facebook;

namespace worklets {

class WorkletRuntimeRegistry {
 private:
  static std::set<jsi::Runtime *> registry_;
  static std::mutex mutex_; // Protects `registry_`.

  WorkletRuntimeRegistry() {} // private ctor

  static void registerRuntime(jsi::Runtime &runtime) {
    std::lock_guard<std::mutex> lock(mutex_);
    registry_.insert(&runtime);
  }

  static void unregisterRuntime(jsi::Runtime &runtime) {
    std::lock_guard<std::mutex> lock(mutex_);
    registry_.erase(&runtime);
  }

  friend class WorkletRuntimeCollector;

 public:
  static bool isRuntimeAlive(jsi::Runtime *runtime) {
    react_native_assert(runtime != nullptr && "runtime is nullptr");
    std::lock_guard<std::mutex> lock(mutex_);
    return registry_.find(runtime) != registry_.end();
  }
};

} // namespace worklets
